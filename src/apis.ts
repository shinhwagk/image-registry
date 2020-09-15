import koa from 'koa'
import koarouter from 'koa-router'

import { api_a } from './apis/a'

const b = (ctx: any) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const c = (ctx: any) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const d = (ctx: any) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const e = (ctx: any) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const f = (ctx: any) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const g = (ctx: any) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`

export const apis: [string, string, koa.Middleware<any, any>][] = [
    ['GET', '/v2', api_a],
    ['GET', '/v2/:repo/:image/manifests/:reference', c],
    ['HEAD', '/v2/:repo/:image/manifests/:reference', d],
    ['GET', '/v2/:repo/:image/blobs/:digest', b],
    ['POST', '/v2/:repo/:image/blobs/uploads/', e],
    ['PATCH', '/v2/:repo/:image/blobs/uploads/:uuid', f],
    ['PUT', '/v2/:repo/:image/blobs/uploads/:uuid', g],
    // ['GET', '/v2/:repo/:image/blobs/upload/:uuid', "a"],
    // ['PATCH', '/v2/:repo/:image/blobs/uploads/:uuid', 'sss'],
    // ['PUT', '/v2/:repo/:image/blobs/uploads/:uuid', 'ss'],
]

const app = new koa()
const router = new koarouter();

apis.forEach(api => {
    const [m, p, h] = api;
    if (m === 'GET') {
        router.get(p, h)
    }
})

app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);

// class ApiServer {

// }

// const server = http.createServer((req, res) => {
//     if(req.url ==='/v2/'){
//       res.statusCode = 200;
//       res.end()
//       return
//     }
//     if(req.url ==='/v2/abc/abc/blobs/sha256:e17d5a50701cd6bff06b8e7f5fc65d70050aa9ce746fdb820f8b46774ce0a174'){
//       res.statusCode = 404;
//       res.end()
//       return
//     }
//     if (req.url === '/v2/abc/abc/blobs/uploads/'){
//       res.writeHead(202,{Location: '/v2/abc/abc/blobs/uploads/aaaa-aaaa-aaaa-aaa','Docker-Upload-UUID':'aaaa-aaaa-aaaa-aaa'});
//       res.end();
//     }
//   //  if(req.url ==='/v2/abc/abc/blobs/sha256:45480dd1290303504b0bced23101b98d0b2cf7960ac245f17f6848d3820061d1'){
//     //  res.writeHead(202,{
//       //            Location: '/v2/abc/abc/blobs/uploads/aaaa-aaaa-aaaa-aaaa'
//        //       });
//      // res.end();
//   //return
//     //}