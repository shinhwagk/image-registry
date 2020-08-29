import * as http from 'http';
import * as fs from 'fs';

import got from 'got';
import koa from 'koa'
import koarouter from 'koa-router'

import { DownManager } from './down';
import { storageDir } from './constants';
import * as layer from './layer'

const app = new koa();
const router = new koarouter();

router.get('/v2', (ctx) => { ctx.body = 'true' })
router.get('/v2/:owner/:name/blobs/:sha256', async (ctx) => {
    const blobsFile = layer.blobsPath(ctx.params.repo, ctx.params.image, ctx.params.sha256)
    if (layer.checkExist(ctx.params.repo, ctx.params.image, ctx.params.sha256)) {
        if (await layer.checkSha256(blobsFile, ctx.params.sha256)) {
            ctx.body = fs.createReadStream(`${storageDir}/${ctx.params.repo}/${ctx.params.image}/${ctx.params.sha256}`)
            return
        }
    }
    console.log('down ')
    DownManager.create(ctx.params.repo, ctx.params.image, ctx.params.sha256).start().then(() => {
        ctx.body = fs.createReadStream(`${storageDir}/${ctx.params.repo}/${ctx.params.image}/${ctx.params.sha256}`)
    })
})
router.get('/v2/:owner/:name/manifests/:sha256', (ctx) => {
    console.log(ctx.req.url)
    ctx.body = ctx.req.pipe(got.stream(`https://quay.io/${ctx.req.url}`))
})
app.use(router.routes()).use(router.allowedMethods()).listen(3001, () => console.log('start.'));