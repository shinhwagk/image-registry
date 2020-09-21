import { createWriteStream } from 'fs-extra';
import koa from 'koa'
import koarouter from 'koa-router'
import { checkManifests, getManifests, checkBlobs, postBlobs, patchBlobs, putBlobs, getBlobs } from './middleware';

export const router = new koarouter();

router.get('/v2', (ctx) => {
    console.log('/v2')
    ctx.status = 200
})

router.head(/^\/v2\/(.+)\/manifests\/(.*)/, checkManifests)
router.get(/^\/v2\/(.+)\/manifests\/(.*)/, checkManifests, getManifests)

router.post(/^\/v2\/(.+?)\/blobs\/uploads\/$/, postBlobs)
router.patch(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/, (ctx) => {
    console.log('patchBlobs', ctx.headers)
    const name = ctx.params[0]
    const uid = ctx.params[1]
    console.log('patchBlobs', name, uid)
    let buf = []
    ctx.req.pipe(createWriteStream('notes/test/patch-' + uid)).on('finish', () => {
        console.log("ssssssssssssssuuuuuuuuuuuuuu")
        console.log(buf.length);
        ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
        ctx.set('Docker-Upload-UUID', uid)
        ctx.set('range', '0-1000')
        console.log("end")
        ctx.status = 202
    })
    // ctx.req.on('error', (e) => console.log(e))
    // ctx.req.on('data', (d) => { buf.push(d); console.log('push') })
    // ctx.req.on('end', () => {

    // })
    // ctx.req.pipe(wr).on('finish', () => {
    // ctx.req.on('data', (c) => console.log(c))
    // ctx.req.on('end', () => {

    // })
})//patchBlobs)
router.head(/^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/, checkBlobs, async (ctx) => { return })
router.put(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/, putBlobs)
router.get(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/, getBlobs)

// router.get(/^\/v2\/(.+)\/manifests\/(.*)/, (ctx) => { ctx.body = "" })

router.all(/(.*)/, (ctx) => {
    console.log("sssssssssssss", ctx.state.aaa)
    console.log("all", ctx.method, ctx.path)
})
// { router }