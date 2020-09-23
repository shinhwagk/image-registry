import * as path from 'path';
import * as url from 'url'

import * as uuid from 'uuid'

import Router from 'koa-router'
import { checkBlobsExist, checkBlobsSha, getBlobsPath, getBlobsSize, getCache, getManifestPath, ManifestSchema, mkdirCache } from './image/image'
import { createWriteStream } from 'fs';
import { statSync } from 'fs';
import { existsSync } from 'fs';
import { sha256sum } from './helper';
import { readFileSync } from 'fs';
import { mkdirpSync, readJsonSync, removeSync } from 'fs-extra';
import { copyFileSync } from 'fs';
import { readdirSync } from 'fs';
import { renameSync } from 'fs';

export const _patch_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_patch_blobs11111111")
    const name = ctx.params[0]
    const uid = ctx.params[1]
    // view.push("==============================")
    // view.push(req.method + " " + req.url)
    // view.push(JSON.stringify(req.headers))
    // view.push("==============================")
    mkdirCache(name)
    const blobsUid = path.join(getCache(name), uid)
    await new Promise<void>((res) => {
        const cws = createWriteStream(blobsUid)
        ctx.req.pipe(cws).on('finish', () => {
            for (const f of readdirSync(getCache(name))) {
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
    if (checkBlobsExist(name, sha) && await checkBlobsSha(name, sha)) {
        console.log("blobs vaild")
        ctx.status = 200
        ctx.type = 'application/json'
        ctx.set('content-length', getBlobsSize(name, sha).toString())

        ctx.body = '{}'
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
    mkdirpSync(path.dirname(getBlobsPath(name, digest)))
    copyFileSync(path.join(getCache(name), uid), getBlobsPath(name, digest))
    removeSync(path.join(getCache(name), uid))
    console.log("copy", path.join(getCache(name), uid), getBlobsPath(name, digest))
    console.log('copy success')
    ctx.status = 201


}

export const _put_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log('put manifests', ctx.req.method, ctx.req.url, ctx.req.headers)
    const name = ctx.params[0]
    const tag = ctx.params[1]
    mkdirpSync(path.join(getManifestPath(name), tag))
    await new Promise<void>((res) => {
        ctx.req.pipe(createWriteStream(path.join(getManifestPath(name), tag, 'file'))).on('finish', res)
    })

    const ms = readJsonSync(path.join(getManifestPath(name), tag, 'file')) as ManifestSchema
    console.log("put", ms.schemaVersion)
    if (ms.schemaVersion === 1) {
        renameSync(path.join(getManifestPath(name), tag, 'file'), path.join(getManifestPath(name), tag, 'vnd.docker.distribution.manifest.v1+json'))
        ctx.set('docker-content-digest', 'sha256:' + await sha256sum(path.join(getManifestPath(name), tag, 'vnd.docker.distribution.manifest.v1+json')))
    } else {
        console.log(path.join(getManifestPath(name), tag, 'file'), path.join(getManifestPath(name), tag, ms.mediaType.substr(12)))
        renameSync(path.join(getManifestPath(name), tag, 'file'), path.join(getManifestPath(name), tag, ms.mediaType.substr(12)))
        ctx.set('docker-content-digest', 'sha256:' + await sha256sum(path.join(getManifestPath(name), tag, ms.mediaType.substr(12))))
    }
    ctx.status = 201

}

export const _get_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_get_manifests", ctx.url)
    const name = ctx.params[0]
    const tag = ctx.params[1]

    if (existsSync(`notes/test/${name}/manifests/${tag}/vnd.docker.distribution.manifest.v2+json`)) {
        const sha = await sha256sum(`notes/test/${name}/manifests/${tag}/vnd.docker.distribution.manifest.v2+json`)
        ctx.status = 200
        ctx.set('content-type', "application/vnd.docker.distribution.manifest.v2+json")
        ctx.set('Docker-Content-Digeste', "sha256:" + sha)
        ctx.body = readFileSync(`notes/test/${name}/manifests/${tag}/vnd.docker.distribution.manifest.v2+json`, { encoding: 'utf8' })
    } else {
        ctx.status = 404
    }
}

export const _get_blobs: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_get_blobs")
    const name = ctx.params[0]
    ctx.status = 100

    // createReadStream(getBlobsPath(name, sha)).pipe(ctx.res)
    console.log("_get_blobs", "end")
}