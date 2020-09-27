import * as path from 'path';
import * as url from 'url'

import { moveSync, readJsonSync, removeSync, readdirSync, createReadStream, readFileSync, createWriteStream, statSync, existsSync, copySync, writeFileSync } from 'fs-extra';
import * as uuid from 'uuid'
import Router from 'koa-router'

import { checkBlobsExist, getBlobsFilePath, getBlobsSize, BlobsCacheDirectory, getManifestsDirectory, getManifestFilePath, ManifestsCacheDirectory, createManifestsDirectories, createBlobsDirectory, checkBlobsSha256sum, ManifestSchema, getManifestFileForDigest } from './storage'
import { sha256sum } from './helper';
import { MANIFEST_UNKNOWN } from './p';

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
    const sha = ctx.params[1]
    if (!checkBlobsExist(name, sha)) {
        ctx.throw(404)
    }
    if (!await checkBlobsSha256sum(name, sha)) {
        removeSync(getBlobsFilePath(name, sha))
        ctx.throw(404)
    }

    console.log("blobs vaild")
    ctx.status = 200
    ctx.type = 'application/json'
    ctx.set('content-length', `${getBlobsSize(name, sha)}`)
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
    const digest: string = url.parse(ctx.req.url, true).query.digest as string
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
    const sha256: string = await sha256sum(tempManifest)

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

export const _get_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_get_manifests", ctx.url)
    const name: string = ctx.params[0]
    const ref: string = ctx.params[1]

    if (!existsSync(getManifestFilePath(name, ref))) {
        console.log("not exist")
        ctx.status = 404
        ctx.body = MANIFEST_UNKNOWN
        return
    }

    const manifestFilePath = ref.startsWith('sha256:') ?
        getManifestFilePath(name, ref) :
        getManifestFilePath(name, readFileSync(getManifestFilePath(name, ref), { encoding: 'utf8' }))

    console.log("manifests", ref)
    const mfObj = readJsonSync(manifestFilePath) as ManifestSchema;
    ctx.status = 200
    ctx.type = (mfObj.schemaVersion === 1 ? 'application/vnd.docker.distribution.manifest.v1+json' : mfObj.mediaType)
    ctx.set('Docker-Content-Digeste', path.basename(manifestFilePath))
    ctx.body = readFileSync(manifestFilePath, { encoding: 'utf8' })
    console.log(ctx.body)
}

export const _get_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_get_blobs")
    const name = ctx.params[0]
    const digest = ctx.params[1]
    if (checkBlobsExist(name, digest)) {
        ctx.type = "application/octet-stream"
        ctx.status = 200
        createReadStream(getBlobsFilePath(name, digest)).pipe(ctx.res)
    } else {
        ctx.status = 404
    }
    console.log("_get_blobs", "end")
}

export const _delete_uploads_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    const uid = ctx.params[1]
    console.log('_delete_blobs')
    console.log(ctx.req.url, ctx.req.method)
    const blobsUid = path.join(BlobsCacheDirectory, uid)
    removeSync(blobsUid)
    ctx.status = 200
}