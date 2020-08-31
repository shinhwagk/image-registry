import * as http from 'http';

import { ProxyImageLayer } from './image'

http.createServer((req, res) => {
    console.log(req.url)
    if (req.url) {
        const params = req.url.split('/')
        if (params.length === 4) {
            const [owner, image, sha256] = req.url.split('/').slice(1)
            console.log(owner, image, sha256)
            console.log("headers", req.headers)
            const pil = ProxyImageLayer.create(owner, image, sha256, req.headers)
            console.log("111111111")
            pil.verify().then(() => pil.blobsStream().pipe(res)).catch(e => {
                res.statusCode = 500;
                res.end(e.message);
            })
        }
    } else {
        res.statusCode = 500;
        res.end();
    }
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