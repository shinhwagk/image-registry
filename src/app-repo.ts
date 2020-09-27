import Koa from 'koa'
import Router from 'koa-router'

import { envAppRepoPort } from './lib/constants';
import { _get_blobs, _get_manifests, _head_blobs, _head_manifests, _patch_blobs, _post_blobs, _put_blobs, _put_manifests, _delete_uploads_blobs } from './lib/middleware';

const router = new Router();
const app = new Koa()

router.get('/v2', (ctx) => { ctx.status = 200; ctx.body = '{}' })
router.patch(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/, _patch_blobs)
router.post(/^\/v2\/(.+?)\/blobs\/uploads\//, _post_blobs)
router.put(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/, _put_blobs)
router.put(/^\/v2\/(.*?)\/manifests\/(.*)$/, _put_manifests)
router.get(/^\/v2\/(.*?)\/manifests\/(.*)$/, _get_manifests)
router.head(/^\/v2\/(.+?)\/manifests\/(.*)/, _head_manifests)
router.head(/^\/v2\/(.+?)\/blobs\/(sha256:[0-9a-zA-Z]{64})$/, _head_blobs)
router.get(/^\/v2\/(.*?)\/blobs\/(sha256:[0-9a-zA-Z]{64})$/, _get_blobs)
router.delete(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)/, _delete_uploads_blobs)
router.all(/.*/, (ctx) => console.log(ctx.method, ctx.url, ctx.headers))

app.use(async (ctx, next) => {
    ctx.set("docker-distribution-api-version", "registry/2.0");
    await next()
    console.log(ctx.method, ctx.url, ctx.res.getHeaders())
})
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(envAppRepoPort, () => console.log('start'));