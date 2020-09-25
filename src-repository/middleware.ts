import * as path from 'path';
import * as url from 'url'

import { moveSync, readJsonSync, removeSync, readdirSync, createReadStream, readFileSync, createWriteStream, statSync, existsSync } from 'fs-extra';
import * as uuid from 'uuid'
import Router from 'koa-router'

import { checkBlobsExist, getBlobsPath, getBlobsSize, BlobsCacheDirectory, getManifestsDirectory, ManifestSchema, getManifestFile, ManifestsCacheDirectory, createManifestsDirectory, createBlobsDirectory, checkBlobsSha256sum } from './storage'
import { sha256sum } from './helper';

export const _patch_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_patch_blobs11111111")
    const name = ctx.params[0]
    const uid = ctx.params[1]
    const blobsUid = path.join(BlobsCacheDirectory, uid)
    await new Promise<void>((res) => {
        const cws = createWriteStream(blobsUid)
        ctx.req.pipe(cws).on('finish', () => {
            for (const f of readdirSync(BlobsCacheDirectory)) {
                if (blobsUid.endsWith(f)) {
                    console.log(f, blobsUid.endsWith(f))
                }
            }

            console.log("end", existsSync(blobsUid), statSync(blobsUid).size)
            // p.end()
            res()
        })
    })

    console.log("end wa", existsSync(blobsUid), statSync(blobsUid).size)
    // console.log("1111111", existsSync(blobsUid))
    // let fstat: Stats
    // try {
    //     fstat = statSync(blobsUid)
    //     console.log("fstat.............", fstat.size, statSync(blobsUid).size)
    // } catch (e) {
    //     console.log("error_patch_blobs11111111 stat 1111111111111111111111111111111111111111111111")
    // }
    ctx.status = 202
    ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.set('range', `0-${statSync(blobsUid).size - 1}`) // must

    ctx.body = '{}'
    console.log("end.........................")
    // return await next()
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
    // return await next();
}

export const _head_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log('_head_blobs', ctx.req.method, ctx.req.url)
    const name = ctx.params[0]
    const sha = ctx.params[1]
    if (checkBlobsExist(name, sha) && await checkBlobsSha256sum(name, sha)) {
        console.log("blobs vaild")
        ctx.status = 200
        ctx.type = 'application/json'
        ctx.set('content-length', getBlobsSize(name, sha).toString())
        ctx.set('Accept-Ranges', 'bytes')
    } else {
        console.log("no exist", ctx.req.url)
        ctx.status = 404
    }

    // console.log("_head_blobs", "end")
    // return await next()
    console.log("111")
}

export const _head_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_head_manifests", "start")
    ctx.body = ""
}

export const _put_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log('putBlobs...1', ctx.req.method, ctx.req.url,)
    const name = ctx.params[0]
    const uid = ctx.params[1]
    // const uid = uuid.v4()
    const digest: string = url.parse(ctx.req.url, true).query.digest as string
    createBlobsDirectory(name)
    moveSync(path.join(BlobsCacheDirectory, uid), getBlobsPath(name, digest))
    console.log("copy", path.join(BlobsCacheDirectory, uid), getBlobsPath(name, digest))
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

    const ms = readJsonSync(tempManifest) as ManifestSchema
    console.log("put version", ms.schemaVersion)
    createManifestsDirectory(name, ref)
    if (ms.schemaVersion === 1) {
        moveSync(tempManifest, path.join(getManifestsDirectory(name, ref), 'vnd.docker.distribution.manifest.v1+json'), { overwrite: true })
        ctx.set('docker-content-digest', 'sha256:' + await sha256sum(path.join(getManifestsDirectory(name, ref), 'vnd.docker.distribution.manifest.v1+json')))
    } else {
        moveSync(tempManifest, path.join(getManifestsDirectory(name, ref), ms.mediaType.substr(12)), { overwrite: true })
        ctx.set('docker-content-digest', 'sha256:' + await sha256sum(path.join(getManifestsDirectory(name, ref), ms.mediaType.substr(12))))
    }
    ctx.status = 201
    ctx.state.a = 1
}

export const _get_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_get_manifests", ctx.url)
    const name = ctx.params[0]
    const ref = ctx.params[1]

    const mf = getManifestFile(name, ref)
    console.log("manifests", mf)
    if (mf) {
        const mfObj = readJsonSync(mf, { encoding: 'utf8' }) as ManifestSchema
        const sha = await sha256sum(mf)
        ctx.status = 200
        ctx.type = (mfObj.schemaVersion === 1 ? 'application/vnd.docker.distribution.manifest.v1+json' : mfObj.mediaType)
        ctx.set('Docker-Content-Digeste', "sha256:" + sha)
        ctx.body = readFileSync(mf, { encoding: 'utf8' })
    } else {
        console.log("not exist")
        ctx.status = 404
    }
}

export const _get_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_get_blobs")
    const name = ctx.params[0]
    const sha = ctx.params[1]

    if (checkBlobsExist(name, sha)) {
        ctx.type = "application/octet-stream"
        ctx.status = 200
        createReadStream(getBlobsPath(name, sha)).pipe(ctx.res)
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