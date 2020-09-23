import { readFileSync } from 'fs';
import { createReadStream } from 'fs';
import { writeFileSync, createWriteStream, statSync, existsSync } from 'fs';
import { mkdirpSync, moveSync } from 'fs-extra';
import * as http from 'http';
import * as url from 'url'

import * as uuid from 'uuid'
import { sha256sum } from './helper';

import { ManifestSchema } from './image'

import Koa from 'koa'
import Router from 'koa-router'
import { _get_blobs, _get_manifests, _head_blobs, _head_manifests, _patch_blobs, _post_blobs, _put_blobs, _put_manifests } from './middleware1';

const router = new Router();
const app = new Koa()

router.get('/v2', (ctx) => { ctx.status = 200 })
router.patch(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/, _patch_blobs)
router.head(/^\/v2\/(.+?)\/manifests\/(.*)/, _head_manifests)
router.post(/^\/v2\/(.+?)\/blobs\/uploads\//, _post_blobs)
router.head(/^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/, _head_blobs)
router.put(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/, _put_blobs)
router.put(/^\/v2\/(.*?)\/manifests\/(.*)$/, _put_manifests)
router.get(/^\/v2\/(.*?)\/manifests\/(.*)$/, _get_manifests)
router.get(/^\/v2\/(.*?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/, _get_blobs)


app.use(router.routes())
app.use(router.allowedMethods())
app.listen(8000, () => console.log('start'));
const requestListener: http.RequestListener = (req, res) => {
    const view = []
    if (req.method === 'PATCH' && req.url && /^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/.test(req.url)) {
        const params = /^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/.exec(req.url)
        const name = params[1]
        const uid = params[2]
        view.push("==============================")
        view.push(req.method + " " + req.url)
        view.push(JSON.stringify(req.headers))
        view.push("==============================")
        mkdirpSync(`notes/test/${name}/blobs/cache`)
        const writeStream = createWriteStream(`notes/test/${name}/blobs/cache/${uid}`);
        req.pipe(writeStream).on('finish', () => {
            console.log("finish1");
            // req.on('end', () => {
            const fstat = statSync(`notes/test/${name}/blobs/cache/${uid}`)
            console.log(uid, fstat.size)
            res.writeHead(202, {
                'Location': `/v2/${name}/blobs/uploads/${uid}`,
                'Docker-Upload-UUID': uid,
                "docker-distribution-api-version": "registry/2.0",
                'range': `0-${fstat.size}` // must
            }).on('error', (e) => console.log(e))
            res.end(() => { })
            // })
        })

        // req.on('data', (d) => { x.push(d) })
        // req.on('end', () => {

        // })

    } else if (req.method === 'GET' && req?.url === '/v2/') {
        console.log('/123')
        res.end()
    } else if (req.method === 'HEAD' && req?.url && /^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/.test(req.url)) {
        const params = /^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/.exec(req.url)
        const name = params[1]
        const sha = params[2]

        console.log('checkblobs', req.method, req.url)
        if (existsSync(`notes/test/${name}/blobs/sha256:${sha}`)) {
            console.log("exist1", `notes/test/${name}/blobs/sha256:${sha}`)
            const s = statSync(`notes/test/${name}/blobs/sha256:${sha}`)
            res.writeHead(200, {
                'content-length': s.size,
                "docker-distribution-api-version": "registry/2.0",
                'Docker-Content-Digest': `sha256:${sha}`
            })
        } else {
            console.log("no exist", req.url)
            res.writeHead(404)
        }
        res.end()
    } else if (req.method === 'POST' && req?.url && /^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/.test(req.url)) {
        const uid = uuid.v4()
        console.log('postBlobs',)
        const x = []

        req.on('data', (d) => { x.push(d) })
        req.on('end', () => {
            console.log('postBlobs ' + x.length)
            res.writeHead(202, {
                'Location': `/v2/${name}/blobs/uploads/${uid}`,
                "docker-distribution-api-version": "registry/2.0",
                'Docker-Upload-UUID': uid
            })
            res.end()
        })
    } else if (req.method === 'POST' && req?.url && /^\/v2\/(.+?)\/blobs\/uploads\//.test(req.url)) {
        const params = /^\/v2\/(.+?)\/blobs\/uploads\//.exec(req.url)
        const name = params[1]
        const uid = uuid.v4()
        res.writeHead(202, { 'Location': `/v2/${name}/blobs/uploads/${uid}`, 'Docker-Upload-UUID': uid })
        res.end()
    } else if (req.method === 'PUT' && req?.url && /^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/.test(url.parse(req.url).pathname)) {
        console.log('putBlobs...1', req.method, req.url,)
        const digest = url.parse(req.url, true).query.digest
        const params = /^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/.exec(url.parse(req.url).pathname)
        const name = params[1]
        const uid = params[2]
        // const uid = uuid.v4()
        const x = []
        req.on('data', (d) => { x.push(d) })
        req.on('end', () => {
            moveSync(`notes/test/${name}/blobs/cache/${uid}`, `notes/test/${name}/blobs/${digest}`, { overwrite: true })
            console.log('putBlobs ' + x.length)
            res.writeHead(201, {
                "docker-distribution-api-version": "registry/2.0",
            })
            res.end()
        })
    } else if (req.method === 'PUT' && req?.url && /v2\/(.*?)\/manifests\/(.*)$/.test(req.url)) {
        console.log('put manifests', req.method, req.url, req.headers)
        const params = /v2\/(.*?)\/manifests\/(.*)$/.exec(req.url)
        const name = params[1]
        const tag = params[2]
        const x = []
        req.on('data', (d) => { x.push(d) })
        req.on('end', () => {
            console.log('put manifests ' + x.length)
            mkdirpSync(`notes/test/${name}/manifests`)
            const ms = JSON.parse(Buffer.concat(x).toString()) as ManifestSchema
            console.log(Buffer.concat(x).toString())
            mkdirpSync(`notes/test/${name}/manifests/${tag}/`)
            let mfile = ''
            if (ms.schemaVersion === 1) {
                mfile = `notes/test/${name}/manifests/${tag}/v1`

            } else {
                mfile = `notes/test/${name}/manifests/${tag}/${ms.mediaType.substr(12)}`

            }
            writeFileSync(mfile, Buffer.concat(x).toString(), { encoding: 'utf8' })
            sha256sum(mfile).then(sha => {
                res.writeHead(201, {
                    "docker-distribution-api-version": "registry/2.0",
                    'docker-content-digest': 'sha256:' + sha
                });
                res.end()
            })

        })
    } else if (req.method === 'GET' && req.url && /v2\/(.*?)\/manifests\/(.*)$/.test(req.url)) {
        console.log('get manifests', req.method, req.url, req.headers)
        const params = /v2\/(.*?)\/manifests\/(.*)$/.exec(req.url)
        const name = params[1]
        const tag = params[2]

        if (existsSync(`notes/test/${name}/manifests/${tag}/vnd.docker.distribution.manifest.v2+json`)) {
            sha256sum(`notes/test/${name}/manifests/${tag}/vnd.docker.distribution.manifest.v2+json`).then(s => {
                res.writeHead(200, {
                    'content-type': "application/vnd.docker.distribution.manifest.v2+json",
                    "docker-distribution-api-version": "registry/2.0",
                    'Docker-Content-Digest': `sha256:${s}`
                }).end(readFileSync(`notes/test/${name}/manifests/${tag}/vnd.docker.distribution.manifest.v2+json`, { encoding: 'utf8' }))
            })

        } else {
            res.writeHead(404, {
                "docker-distribution-api-version": "registry/2.0",
            }).end()
        }

    } else if (req.method === 'GET' && req?.url && /^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/.test(req.url)) {
        const params = /^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/.exec(req.url)
        const name = params[1]
        const sha = params[2]
        res.writeHead(200, {
            "docker-distribution-api-version": "registry/2.0",
        })
        createReadStream(`notes/test/${name}/blobs/sha256:${sha}`).pipe(res)
    } else {
        console.log("=========================================")
        console.log(req.method, req.url, req.headers)
        console.log("other")
        console.log("=========================================")
    }
}

http.createServer(requestListener).listen(8000, () => console.log("start"))
