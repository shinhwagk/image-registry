import * as http from 'http';
import * as fs from 'fs';

import got from 'got';

import { DownManager } from './down';
import { storageDir, proxyRepo } from './constants';
import { ProxyImageLayer } from './image'

http.createServer((req, res) => {
    (async () => {
        if (req.url) {
            const params = req.url.split('')
            if (params.length === 4) {
                const [owner, image, sha256] = req.url.split('/').slice(1)
                const pil = ProxyImageLayer.create(owner, image, sha256)
                await pil.verify()
                return;
            }
        }
        res.statusCode = 500;
        res.end();
    })()
}).listen(3001, () => console.log('start.'))
// router.get('/v2', (ctx) => { ctx.body = 'true' })
// router.get('/:owner/:name/:sha256', async (ctx) => {
//     const blobsFile = layer.blobsPath(proxyRepo, ctx.params.owner + '/' + ctx.params.image, ctx.params.sha256)
//     if (layer.checkExist(ctx.params.repo, ctx.params.image, ctx.params.sha256)) {
//         if (await layer.checkSha256(blobsFile, ctx.params.sha256)) {
//             ctx.body = fs.createReadStream(`${storageDir}/${ctx.params.repo}/${ctx.params.image}/${ctx.params.sha256}`)
//             return
//         }
//     }
//     console.log('down ')
//     DownManager.create(ctx.params.repo, ctx.params.image, ctx.params.sha256).start().then(() => {
//         ctx.body = fs.createReadStream(`${storageDir}/${ctx.params.repo}/${ctx.params.image}/${ctx.params.sha256}`)
//     })
// })
// // router.get('/v2/:owner/:name/manifests/:sha256', (ctx) => {
// //     console.log(ctx.req.url)
// //     ctx.body = ctx.req.pipe(got.stream(`https://quay.io/${ctx.req.url}`))
// // })
// app.use(router.routes()).use(router.allowedMethods()).listen(3001, () => console.log('start.'));