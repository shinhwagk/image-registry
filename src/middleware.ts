import * as path from 'path';

import { moveSync, readJsonSync, removeSync, createWriteStream, statSync, copySync, writeFileSync } from 'fs-extra';
import * as uuid from 'uuid'
import Router from 'koa-router'
import Koa from 'koa'

import { checkblobExist, getblobFilePath, blobsCacheDirectory, getManifestsDirectory, ManifestsCacheDirectory, createManifestsDirectories, createblobDirectory, checkblobSha256sum, getManifestFileForDigest, DistributionFS } from './storage'
import { sha256sumOnFile, sleep } from './helper';
import { BLOB_UNKNOWN, MANIFEST_UNKNOWN, TOOMANYREQUESTS } from './protocols';
import { envDownProxyPrefix, envDownProxyRepos } from './constants';
import { RegistryClient } from './client';
import { ManifestSchema, ManifestSchemaV2, KoaStateContext } from './types';
import { ThirdRegistry } from './registry';

export const _patch_blob: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    console.log("_patch_blob11111111")
    const name = ctx.params[0]
    const uid = ctx.params[1]
    const blobUid = path.join(blobsCacheDirectory, uid)
    await new Promise<void>((res) => ctx.req.pipe(createWriteStream(blobUid)).on('finish', res))
    ctx.status = 202
    ctx.set('Location', `/v2/${name}/blob/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.set('range', `0-${statSync(blobUid).size - 1}`) // must
    ctx.body = '{}'
    console.log("end.........................")
}

export const _post_blob: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    const name = ctx.params[0]
    const uid = uuid.v4()
    console.log('postblob', ctx.req.url, ctx.req.headers)
    ctx.status = 202

    ctx.set('Location', `/v2/${name}/blob/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.type = 'application/json'
    ctx.body = '{}'
}

export const _req_blob: Router.IMiddleware = async (ctx: KoaStateContext, next: () => Promise<void>) => {
    console.log("_req_blob")
    const digest = ctx.state.digest = ctx.params[1]
    if (! await ctx.state.storage.validateBlob(digest)) {
        await next()
    }
    console.log("_req_blob back")
    if (await ctx.state.storage.validateBlob(digest)) {
        ctx.type = "application/octet-stream"
        ctx.set('Docker-Content-Digest', digest)
        ctx.set('Accept-Ranges', 'bytes')
        ctx.status = 200
        if (ctx.method === 'GET') {
            ctx.body = ctx.state.storage.readerBlob(digest)
        } else {
            ctx.set('Content-Length', ctx.state.storage.statBlob(digest).size.toString())
        }
    } else {
        ctx.status = 404
        ctx.body = BLOB_UNKNOWN
    }
}

export const _put_blob: Router.IMiddleware = async (ctx: KoaStateContext) => {
    console.log('putblob...1', ctx.req.method, ctx.req.url,)
    const name = ctx.params[0]
    const uid = ctx.params[1]
    const digest: string = ctx.query.digest as string

    if (checkblobExist(name, digest) && await checkblobSha256sum(name, digest)) {
        removeSync(path.join(blobsCacheDirectory, uid))
    } else {
        createblobDirectory(name)
        moveSync(path.join(blobsCacheDirectory, uid), getblobFilePath(name, digest))
    }
    console.log("copy", path.join(blobsCacheDirectory, uid), getblobFilePath(name, digest))
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
    const mediaType: string = ms.schemaVersion === 1 ? 'vnd.docker.distribution.manifest.v1+json' : (ms as ManifestSchemaV2).mediaType.substr(12)
    writeFileSync(path.join(getManifestsDirectory(name, ref), mediaType), `sha256:${sha256}`, { encoding: "utf8" })
    ctx.set('docker-content-digest', 'sha256:' + sha256)
    copySync(tempManifest, getManifestFileForDigest(name, 'sha256:' + sha256), { overwrite: true })
    removeSync(tempManifest)
    ctx.status = 201
}

export const _req_manifest: Router.IMiddleware = async (ctx: KoaStateContext, next: () => Promise<void>) => {
    console.log("_req_manifests")
    const ref: string = ctx.state.ref = ctx.params[1]
    let manifest = ctx.state.storage.findManifest(ref)
    console.log(333, ref)
    if (ctx.state.proxy && manifest === undefined) {
        await next()
    }
    console.log("_req_manifests back.")
    manifest = manifest || ctx.state.storage.findManifest(ref)
    if (manifest === undefined) {
        ctx.status = 404
        ctx.body = MANIFEST_UNKNOWN
        return
    }
    const statManifest = ctx.state.storage.statManifest(ref, manifest)
    ctx.status = 200
    ctx.type = statManifest.mediaType
    ctx.set('Docker-Content-Digeste', statManifest.digest)
    if (ctx.method === 'GET') {
        ctx.body = ctx.state.storage.readerRawManfiest(statManifest.digest)
    } else {
        ctx.set('Content-Length', statManifest.size.toString())
    }
}

export const _delete_uploads_blob: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    const uid = ctx.params[1]
    console.log('_delete_blob')
    const blobUid = path.join(blobsCacheDirectory, uid)
    removeSync(blobUid)
    ctx.status = 200
}

export const _down_manifests: Router.IMiddleware = async (ctx: Koa.ParameterizedContext<{ registryClient: RegistryClient, name: string, ref: string, proxyRepo: string }>) => {
    console.log("_try_down_manifests")
    try {
        await ctx.state.registryClient.gotManifest(ctx.state.ref)
    } catch (e) {
        console.log("_try_down_manifest false", e.message)
    }
}

export const _down_blob: Router.IMiddleware = async (ctx: KoaStateContext) => {
    console.log("_try_down_blob")
    try {
        await ctx.state.registryClient.gotBlob(ctx.state.digest)
    } catch (e) {
        console.log("_down_blob faile", e.message)
    }
}

export const _set_state: Router.IMiddleware = async (ctx: KoaStateContext, next: () => Promise<void>) => {
    console.log("_set_state")
    const sName = ctx.state.name = ctx.params[0].split('/')
    if (sName[0] === envDownProxyPrefix
        && envDownProxyRepos.includes(sName[1])
    ) {
        ctx.state.fullName = sName.slice(1).join('/');
        ctx.state.name = sName.slice(2).join('/');
        ctx.state.proxyDaemon = sName[1]
        ctx.state.storage = new DistributionFS(ctx.state.proxyDaemon, ctx.state.name);
        ctx.state.proxy = true;
        ctx.state.proxyPrefix = sName[0];
        const registry = ThirdRegistry[ctx.state.proxyDaemon]
        if (registry === undefined) {
            ctx.throw(404, 'Third repo no exist')
        }
        ctx.state.registryClient = new RegistryClient(registry, sName.slice(2).join('/'), ctx.state.storage);
    } else {
        ctx.state.proxy = false;
        ctx.state.name = ctx.params[0]
        ctx.state.storage = new DistributionFS(ctx.hostname, ctx.state.name);
    }
    await next()
}

export function _request_control(maxParallel: number): Router.IMiddleware {
    let p = 0;
    return async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
        console.log("_request_control")
        for (let i = 0; i <= 5; i++) {
            if (p > maxParallel) {
                await sleep(1000)
            } else {
                p += 1
                try {
                    return await next()
                } finally {
                    p -= 1
                }
            }
        }
        ctx.type = 'json'
        ctx.status = 429
        ctx.body = TOOMANYREQUESTS
    }
}

export const _set_headers: Router.IMiddleware = async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
    ctx.set("docker-distribution-api-version", "registry/2.0");
    ctx.set("server", "koa/registry")
    ctx.type = 'json'
    await next()
}
