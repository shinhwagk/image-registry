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

export const _head_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
    console.log('_head_blobs', ctx.req.method, ctx.req.url)
    ctx.state.digest = ctx.params[1]
    await next()

    if (!checkBlobsExist(ctx.state.name, ctx.state.digest)) {
        if (!await checkBlobsSha256sum(ctx.state.name, ctx.state.digest)) {
            removeSync(getBlobsFilePath(ctx.state.name, ctx.state.digest))
        }
        ctx.status = 404
        ctx.body = BLOB_UNKNOWN
        return
    }

    console.log("blobs vaild")
    ctx.status = 200
    ctx.type = 'application/json'
    ctx.set('content-length', `${getBlobsSize(ctx.state.name, ctx.state.digest)}`)
    ctx.set('Accept-Ranges', 'bytes')
}

export const _head_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
    console.log("_head_manifests")
    ctx.state.ref = ctx.params[1]
    await next()
    console.log("_head_manifests", "start")
    ctx.status = 200
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
    const ref: string = ctx.state.ref = ctx.params[1]
    await next()
    if (!getManifestFilePath(ctx.state.name, ctx.state.ref)) {
        ctx.type = 'json'
        ctx.status = 404
        ctx.body = MANIFEST_UNKNOWN
        return
    }

    const name: string = ctx.state.name
    console.log(name)
    const manifestFilePath = ref.startsWith('sha256:') ?
        getManifestFilePath(name, ref) :
        getManifestFilePath(name, readFileSync(getManifestFilePath(name, ref), { encoding: 'utf8' }))

    console.log("manifests", ref)
    const mfObj = readJsonSync(manifestFilePath) as ManifestSchema;
    ctx.status = 200
    ctx.type = (mfObj.schemaVersion === 1 ? 'application/vnd.docker.distribution.manifest.v1+json' : mfObj.mediaType)
    ctx.set('Docker-Content-Digeste', path.basename(manifestFilePath))
    ctx.body = readFileSync(manifestFilePath, { encoding: 'utf8' })
}

export const _get_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
    console.log("_get_blobs")
    const digest = ctx.state.digest = ctx.params[1]
    await next()

    if (checkBlobsExist(ctx.state.name, digest) && checkBlobsSha256sum(ctx.state.name, digest)) {
        ctx.type = "application/octet-stream"
        ctx.body = createReadStream(getBlobsFilePath(ctx.state.name, digest))
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
    const rc: RegistryClient = ctx.state.registryClient
    try {
        await rc.downManifest(ctx.state.ref)
    } catch (e) {
        console.log("_try_down_manifest false", e.message)
    }
}

export const _try_down_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_try_down_blobs")
    const rc: RegistryClient = ctx.state.registryClient
    try {
        await rc.downBlobs(ctx.state.digest)
    } catch (e) {
        console.log("_try_down_blobs false", e.message)
    }
}

export const _set_proxy: Router.IMiddleware = async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
    console.log("_check_down")
    const name: string = ctx.state.name = ctx.params[0]
    const sName = name.split('/')
    if (name.startsWith(`${envDownProxyPrefix}/`)
        && envDownProxyRepos.includes(sName[1])) {
        ctx.state.name = sName.slice(2).join('/')
        ctx.state.proxyRepo = sName[1]
        ctx.state.registryClient = new RegistryClient(ctx.state.proxyRepo, ctx.state.name)
        ctx.state.down = true
        await next()
    }
}

export const _check_manifest: Router.IMiddleware = async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
    await next()
    console.log(ctx.state.ref)
    console.log(getManifestFilePath(ctx.state.name, ctx.state.ref))
    if (!getManifestFilePath(ctx.state.name, ctx.state.ref)) {
        console.log("_check_manifest")
        console.log("manifest not exist")
        ctx.type = 'json'
        ctx.status = 404
        ctx.body = MANIFEST_UNKNOWN
        ctx.throw(404, JSON.stringify({ error: 'Encountered an error' }), { expose: true });
        // ctx.res.end()
        return
    }
}
