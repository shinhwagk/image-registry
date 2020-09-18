import { requestManifest, ManifestSchema, checkpointManifest, checkBlobsExist, requestBlobs } from "./image";
import { } from './registry/client'
import * as crypto from 'crypto'
import { getManifest } from "./image";
import { proxyRepo } from "./constants";
import * as uuid from 'uuid'
import { createWriteStream } from "fs-extra";



// export function setHeader(ctx, next) {
//     ctx

// }

export async function checkManifests(ctx: any, next) {
    const name = ctx.params[0]
    const ref = ctx.params[1]

    console.log('api_d')
    let mf: string | undefined = getManifest(name, ref)
    if (mf === undefined) {
        console.log('requestManifest')
        mf = await requestManifest(name, ref)
        checkpointManifest(name, ref, mf)
    }
    const hash = crypto.createHash('sha256').update(mf).digest('hex');

    console.log(hash)
    ctx.set('Docker-Content-Digest', 'sha256:' + hash)
    ctx.set('content-type', JSON.parse(mf).mediaType)
    console.log(mf, 111111)
    ctx.status = 200
    ctx.state.mf = mf
    await next()
}

export async function getManifests(ctx, next) {
    await next()
    console.log('aaaa', ctx.state.mf)
    ctx.body = ctx.state.mf
}


export async function checkBlobs(ctx, next) {
    console.log('checkblobs')
    const name = ctx.params[0]
    const sha = ctx.params[1]
    if (checkBlobsExist(name, sha)) {
        ctx.status = 200
    } else {
        ctx.status = 404
        // requestBlobs(name, sha)
    }
    await next()
}

export async function postBlobs(ctx, next) {
    console.log('postBlobs')
    const name = ctx.params[0]
    const uid = uuid.v4()
    ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.status = 202
}

export async function patchBlobs(ctx, next) {
    console.log('patchBlobs')
    const name = ctx.params[0]
    const uid = ctx.params[1]
    ctx.req.pipe(createWriteStream('./abc'))
    console.log(ctx.headers)
    // const uid = uuid.v4()
    ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.set('Range', '0')
    ctx.status = 204
}

export async function putBlobs(ctx, next) {
    console.log('putBlobs')

    // const uid = uuid.v4()
    // ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
    // ctx.set('Docker-Upload-UUID', uid)
    ctx.status = 200
}
export async function getBlobs(ctx, next) {
    console.log('getBlobs')

    // const uid = uuid.v4()
    // ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
    // ctx.set('Docker-Upload-UUID', uid)
    ctx.status = 200
}