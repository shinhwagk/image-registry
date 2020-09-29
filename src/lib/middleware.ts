import * as path from 'path';

import { moveSync, readJsonSync, removeSync, createReadStream, readFileSync, createWriteStream, statSync, existsSync, copySync, writeFileSync } from 'fs-extra';
import * as uuid from 'uuid'
import Router from 'koa-router'

import { checkBlobsExist, getBlobsFilePath, getBlobsSize, BlobsCacheDirectory, getManifestsDirectory, getManifestFilePath, ManifestsCacheDirectory, createManifestsDirectories, createBlobsDirectory, checkBlobsSha256sum, getManifestFileForDigest } from './storage'
import { sha256sumOnFile } from './helper';
import { BLOB_UNKNOWN, MANIFEST_UNKNOWN } from './protocols';
import { envDownProxyPrefix, envDownProxyRepos } from './constants';
import { RegistryClient } from './client';
import { ManifestSchema } from './types';

export const _patch_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_patch_blobs11111111")
    const name = ctx.params[0]
    const uid = ctx.params[1]
    const blobsUid = path.join(BlobsCacheDirectory, uid)
    await new Promise<void>((res) => ctx.req.pipe(createWriteStream(blobsUid)).on('finish', res))
    ctx.status = 202
    ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.set('range', `0-${statSync(blobsUid).size - 1}`) // must
    ctx.body = '{}'
    console.log("end.........................")
}

export const _post_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    const name = ctx.params[0]
    const uid = uuid.v4()
    console.log('postBlobs', ctx.req.url, ctx.req.headers)
    ctx.status = 202

    ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.type = 'application/json'
    ctx.body = '{}'
}

export const _head_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log('_head_blobs', ctx.req.method, ctx.req.url)
    const name = ctx.params[0]
    const digest = ctx.params[1]
    if (!checkBlobsExist(name, digest)) {
        ctx.status = 404
        ctx.body = BLOB_UNKNOWN
        return
    }
    if (!await checkBlobsSha256sum(name, digest)) {
        removeSync(getBlobsFilePath(name, digest))
        ctx.status = 404
        ctx.body = BLOB_UNKNOWN
        return
    }

    console.log("blobs vaild")
    ctx.status = 200
    ctx.type = 'application/json'
    ctx.set('content-length', `${getBlobsSize(name, digest)}`)
    ctx.set('Accept-Ranges', 'bytes')
}

export const _head_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_head_manifests", "start")
    ctx.body = ""
}

export const _put_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log('putBlobs...1', ctx.req.method, ctx.req.url,)
    const name = ctx.params[0]
    const uid = ctx.params[1]
    const digest: string = ctx.query.digest as string

    if (checkBlobsExist(name, digest) && await checkBlobsSha256sum(name, digest)) {
        removeSync(path.join(BlobsCacheDirectory, uid))
    } else {
        createBlobsDirectory(name)
        moveSync(path.join(BlobsCacheDirectory, uid), getBlobsFilePath(name, digest))
    }
    console.log("copy", path.join(BlobsCacheDirectory, uid), getBlobsFilePath(name, digest))
    console.log('copy success')
    ctx.status = 201
}

export const _put_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log('put manifests', ctx.req.method, ctx.req.url, ctx.req.headers)
    const name = ctx.params[0]
    const ref = ctx.params[1]
    const mfuid = uuid.v4()

    const tempManifest = path.join(ManifestsCacheDirectory, mfuid)
    await new Promise<void>((res, rej) => {
        ctx.req.pipe(createWriteStream(tempManifest))
            .on('finish', res)
            .on('error', (e) => rej(e.message))
    })
    const sha256: string = await sha256sumOnFile(tempManifest)

    const ms = readJsonSync(tempManifest) as ManifestSchema
    console.log("put version", ms.schemaVersion)
    createManifestsDirectories(name, ref)
    const mediaType: string = ms.schemaVersion === 1 ? 'vnd.docker.distribution.manifest.v1+json' : ms.mediaType.substr(12)
    writeFileSync(path.join(getManifestsDirectory(name, ref), mediaType), `sha256:${sha256}`, { encoding: "utf8" })
    ctx.set('docker-content-digest', 'sha256:' + sha256)
    console.log(getManifestFileForDigest(name, 'sha256:' + sha256))
    copySync(tempManifest, getManifestFileForDigest(name, 'sha256:' + sha256), { overwrite: true })
    removeSync(tempManifest)
    ctx.status = 201
}

export const _get_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
    console.log("_get_manifests")
    const name: string = ctx.params[0]
    const fmtName = name.split('/')
    ctx.state.name = ctx.params[0]
    ctx.state.ref = ctx.params[1]
    if (fmtName.length === 4 && name.startsWith(`${envDownProxyPrefix}/`)
        && envDownProxyRepos.includes(fmtName[1])
        && !existsSync(getManifestFilePath(name, ctx.state.ref))) {
        ctx.state.name = fmtName.slice(2).join('/')
        ctx.state.proxyRepo = fmtName[1]
        ctx.state.registryClient = new RegistryClient(ctx.state.proxyRepo, ctx.state.name)
        await next()
    }

    console.log("_get_manifests", ctx.params)
    const iname: string = ctx.state.name
    const iref: string = ctx.state.ref

    if (!existsSync(getManifestFilePath(iname, iref))) {
        console.log("manifest not exist")
        ctx.status = 404
        ctx.body = MANIFEST_UNKNOWN
        return
    }

    const manifestFilePath = iref.startsWith('sha256:') ?
        getManifestFilePath(iname, iref) :
        getManifestFilePath(iname, readFileSync(getManifestFilePath(iname, iref), { encoding: 'utf8' }))

    console.log("manifests", iref)
    const mfObj = readJsonSync(manifestFilePath) as ManifestSchema;
    ctx.status = 200
    ctx.type = (mfObj.schemaVersion === 1 ? 'application/vnd.docker.distribution.manifest.v1+json' : mfObj.mediaType)
    ctx.set('Docker-Content-Digeste', path.basename(manifestFilePath))
    ctx.body = readFileSync(manifestFilePath, { encoding: 'utf8' })
}

export const _get_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
    console.log("_get_blobs")
    const name: string = ctx.params[0]
    const fmtName = name.split('/')
    ctx.state.name = ctx.params[0]
    ctx.state.digest = ctx.params[1]
    if (fmtName.length === 4 && name.startsWith(`${envDownProxyPrefix}/`)
        && envDownProxyRepos.includes(fmtName[1])
        && !(checkBlobsExist(ctx.state.name, ctx.state.digest)
            && checkBlobsSha256sum(ctx.state.name, ctx.state.digest))) {
        ctx.state.name = fmtName.slice(2).join('/')
        ctx.state.proxyRepo = fmtName[1]
        ctx.state.registryClient = new RegistryClient(ctx.state.proxyRepo, ctx.state.name)
        await next()
    }

    if (checkBlobsExist(ctx.state.name, ctx.state.digest) && checkBlobsSha256sum(ctx.state.name, ctx.state.digest)) {
        ctx.type = "application/octet-stream"
        ctx.body = createReadStream(getBlobsFilePath(ctx.state.name, ctx.state.digest))
    } else {
        ctx.status = 404
        ctx.body = BLOB_UNKNOWN
    }
}

export const _delete_uploads_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    const uid = ctx.params[1]
    console.log('_delete_blobs')
    const blobsUid = path.join(BlobsCacheDirectory, uid)
    removeSync(blobsUid)
    ctx.status = 200
}

export const _try_down_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_try_down_manifests")
    const ref: string = ctx.state.ref
    const rc: RegistryClient = ctx.state.registryClient
    await rc.downManifest(ref)
}

export const _try_down_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_try_down_blobs")
    const rc: RegistryClient = ctx.state.registryClient
    await rc.downBlobs(ctx.state.digest)
}