import * as path from 'path';

import { moveSync, readJsonSync, removeSync, createWriteStream, statSync, copySync, writeFileSync, createReadStream, existsSync } from 'fs-extra';
import * as uuid from 'uuid'
import Router from 'koa-router'
import Koa from 'koa'

import { checkblobExist, getblobFilePath, blobsCacheDirectory, getManifestsDirectory, ManifestsCacheDirectory, createManifestsDirectories, createBlobsDirectory, checkblobSha256sum, getManifestFileForDigest, DistributionFS } from './storage'
import { sha256sumOnFile, sleep } from './helper';
import { BLOB_UNKNOWN, MANIFEST_UNKNOWN, TOOMANYREQUESTS } from './protocols';
import { envDownProxyPrefix, envDownProxyRepos } from './constants';
import { RegistryClient } from './client';
import { ManifestSchema, ManifestSchemaV2, KoaStateContext } from './types';
import { ThirdRegistry } from './registry';
import { create } from './logger';
import { Logger } from 'winston';

export const _patch_blob: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    const logger: Logger = ctx.state.logger('_patch_blob')
    const name = ctx.params[0]
    const uid = ctx.params[1]
    const blobUid = path.join(blobsCacheDirectory, uid)
    await new Promise<void>((res) => ctx.req.pipe(createWriteStream(blobUid)).on('finish', res))
    ctx.status = 202
    ctx.set('Location', `/v2/${name}/blob/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.set('range', `0-${statSync(blobUid).size - 1}`) // must
    ctx.body = '{}'
}

export const _post_blob: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    const logger: Logger = ctx.state.logger('_post_blob')
    const name = ctx.params[0]
    const uid = uuid.v4()
    logger.info(`${name} ${uid}`)
    ctx.status = 202
    ctx.set('Location', `/v2/${name}/blob/uploads/${uid}`)
    ctx.set('Docker-Upload-UUID', uid)
    ctx.type = 'application/json'
    ctx.body = '{}'
}

export const _req_blob: Router.IMiddleware = async (ctx: KoaStateContext, next: () => Promise<void>) => {
    const logger: Logger = ctx.method === 'HEAD' ? ctx.state.logger('_head_blob') : ctx.state.logger('_get_blob')
    logger.info("check proxy external proxy")
    const digest = ctx.state.digest = ctx.params[1]
    if (!(await ctx.state.storage.validateBlob(digest)) && ctx.state.proxy) {
        await next()
    }
    logger.info("_req_blob back")
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
    const logger: Logger = ctx.state.logger('_put_blob')
    const uuid = ctx.params[1]
    const digest: string = ctx.query.digest as string

    if (await ctx.state.storage.validateBlob(digest)) {
        logger.info("exist")
    } else {
        await ctx.state.storage.writerBlob(digest, uuid)
    }
    ctx.status = 201
}

export const _put_manifests: Router.IMiddleware = async (ctx: Router.IRouterContext) => {
    const logger: Logger = ctx.state.logger('_put_manifests')
    const name = ctx.params[0]
    const ref = ctx.params[1]
    const _uuid = uuid.v4()

    const tempManifest = path.join(ManifestsCacheDirectory, _uuid)
    await new Promise<void>((res, rej) => {
        ctx.req.pipe(createWriteStream(tempManifest))
            .on('finish', res)
            .on('error', (e) => rej(e.message))
    })
    const sha256: string = await sha256sumOnFile(tempManifest)

    const ms = readJsonSync(tempManifest) as ManifestSchema
    logger.info("put version " + ms.schemaVersion)
    createManifestsDirectories(name, ref)
    const mediaType: string = ms.schemaVersion === 1 ? 'vnd.docker.distribution.manifest.v1+json' : (ms as ManifestSchemaV2).mediaType.substr(12)
    writeFileSync(path.join(getManifestsDirectory(name, ref), mediaType), `sha256:${sha256}`, { encoding: "utf8" })
    ctx.set('docker-content-digest', 'sha256:' + sha256)
    copySync(tempManifest, getManifestFileForDigest(name, 'sha256:' + sha256), { overwrite: true })
    removeSync(tempManifest)
    ctx.status = 201
}

export const _req_manifest: Router.IMiddleware = async (ctx: KoaStateContext, next: () => Promise<void>) => {
    const logger: Logger = ctx.state.logger('_req_manifests')
    const ref: string = ctx.state.ref = ctx.params[1]
    let manifest = ctx.state.storage.findManifest(ref)
    if (ctx.state.proxy && manifest === undefined) {
        logger.info(ctx.state.proxy + ' ' + manifest)
        await next()
    }
    logger.info("_req_manifests back.")
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
    const logger: Logger = ctx.state.logger('_req_manifests')
    logger.info('_delete_blob')
    const uid = ctx.params[1]
    const blobUid = path.join(blobsCacheDirectory, uid)
    removeSync(blobUid)
    ctx.status = 200
}

export const _down_manifest: Router.IMiddleware = async (ctx: KoaStateContext) => {
    const logger: Logger = ctx.state.logger('_down_manifests')
    try {
        logger.info(`down manifest ${ctx.state.fullName} ${ctx.state.ref}`)
        await ctx.state.registryClient.gotManifest(ctx.state.ref)
    } catch (e) {
        logger.error("_try_down_manifest false: " + e.message)
    }
}

export const _down_blob: Router.IMiddleware = async (ctx: KoaStateContext) => {
    const logger: Logger = ctx.state.logger('_down_blob')
    try {
        await ctx.state.registryClient.gotBlob(ctx.state.digest)
    } catch (e) {
        logger.error(`_down_blob failure : ${e.message}`)
    }
}

export const _set_state: Router.IMiddleware = async (ctx: KoaStateContext, next: () => Promise<void>) => {
    const logger: Logger = ctx.state.logger('_set_state')
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
        ctx.state.name = sName.join('/')
        ctx.state.daemon = ctx.hostname
        ctx.state.fullName = ctx.hostname + '/' + ctx.state.name
        ctx.state.storage = new DistributionFS(ctx.state.daemon, ctx.state.name);
    }
    await next()
}

export function _request_control(maxParallel: number): Router.IMiddleware {
    let p = 0;
    return async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
        const logger: Logger = ctx.state.logger('_request_control')
        for (let i = 0; i <= 5; i++) {
            if (p > maxParallel) {
                await sleep(1000)
            } else {
                p += 1
                try {
                    return await next()
                } finally {
                    p -= 1
                    logger.debug("parallel " + p)
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


export function _set_logger(module: string): Router.IMiddleware {
    return async (ctx: Router.IRouterContext, next: () => Promise<void>) => {
        ctx.state.logger = create(module)
        await next()
    }
}