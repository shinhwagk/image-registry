import Koa from 'koa'
import Router from 'koa-router'

import { envAllPort } from './constants';
import { develConsole } from './logger';
import { _req_blob, _req_manifest, _patch_blob, _post_blob, _put_blob, _put_manifests, _delete_uploads_blob, _down_manifest, _down_blob, _set_state, _request_control, _set_headers, _set_logger } from './middleware';
import { createblobCacheDirectory, createManifestsCacheDirectory } from './distribution';

const router = new Router();
const app = new Koa()

router.get('/v2', (ctx) => { ctx.status = 200; ctx.body = '{}'; })
router.patch(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/, _patch_blob)
router.post(/^\/v2\/(.+?)\/blobs\/uploads\//, _post_blob)
router.put(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)/, _set_state, _put_blob)
router.put(/^\/v2\/(.+?)\/manifests\/(.*)$/, _put_manifests)
router.head(/^\/v2\/(.+?)\/manifests\/(.*)/, _set_state, _req_manifest, _down_manifest)
router.get(/^\/v2\/(.+?)\/manifests\/(.*)$/, _set_state, _req_manifest, _down_manifest)
router.head(/^\/v2\/(.+?)\/blobs\/(sha256:[0-9a-zA-Z]{64})$/, _set_state, _req_blob, _down_blob)
router.get(/^\/v2\/(.+?)\/blobs\/(sha256:[0-9a-zA-Z]{64})$/, _set_state, _req_blob, _down_blob)
router.delete(/^\/v2\/(.+?)\/blobs\/uploads\/(.*)/, _delete_uploads_blob)
router.all(/.*/, (ctx) => develConsole("other", ctx.method, ctx.url, ctx.headers))

app.use(async (ctx, next) => {
    develConsole("view", ctx.method, ctx.url)
    await next()
})
app.use(_set_logger('koa/registry'))
app.use(_set_headers)
app.use(_request_control(30))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(envAllPort, () => {
    // init operations
    createManifestsCacheDirectory();
    createblobCacheDirectory();
    develConsole('all service start.')
});
