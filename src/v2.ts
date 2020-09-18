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

router.post(/^\/v2\/(.+)\/blobs\/uploads\/$/, postBlobs)
router.patch(/^\/v2\/(.+)\/blobs\/uploads\/(.*)/, (ctx) => {
    console.log('patchBlobs')
    const name = ctx.params[0]
    const uid = ctx.params[1]
    ctx.req.on('data', (c) => console.log(c))
    ctx.req.on('end', () => {
        ctx.set('Location', `/v2/${name}/blobs/uploads/${uid}`)
        ctx.set('Docker-Upload-UUID', uid)
        console.log("end")
        ctx.status = 204
    })
})//patchBlobs)
router.put(/^\/v2\/(.+)\/blobs\/uploads\/(.*)/, putBlobs)
router.get(/^\/v2\/(.+)\/blobs\/uploads\/(.*)/, getBlobs)

// router.get(/(.*)/, (ctx) => {
//     console.log("sssssssssssss")
//     console.log(ctx.method, ctx.path)
// })
router.head(/^\/v2\/(.+)\/blobs\/sha256:([0-9a-zA-Z]{64})$/, checkBlobs)

// router.get(/^\/v2\/(.+)\/manifests\/(.*)/, (ctx) => { ctx.body = "" })

// { router }