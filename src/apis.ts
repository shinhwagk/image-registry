import koa from 'koa'
import koarouter from 'koa-router'

// import { api_a } from './apis/a'
import { api_a, api_b, api_d } from './middlewares'

const b = (ctx) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const c = (ctx) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const d = (ctx) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const e = (ctx) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const f = (ctx) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`
const g = (ctx) => ctx.body = `${ctx.params.repo} ${ctx.params.image} ${ctx.params.digest}`

const apis: [string, string | RegExp, any][] = [
    ['GET', '/v2', api_a],
    ['HEAD', /^\/v2\/(.+)\/manifests\/(.*)/, api_d],
    ['GET', /^\/v2\/(.+)\/manifests\/(.*)/, api_d],
    // ['GET', '/v2/:repo/:image/blobs/:digest', b],
    // ['POST', '/v2/:repo/:image/blobs/uploads/', e],
    // ['PATCH', '/v2/:repo/:image/blobs/uploads/:uuid', f],
    // ['PUT', '/v2/:repo/:image/blobs/uploads/:uuid', g],
    // ['GET', '/v2/:repo/:image/blobs/upload/:uuid', "a"],
    // ['PATCH', '/v2/:repo/:image/blobs/uploads/:uuid', 'sss'],
    // ['PUT', '/v2/:repo/:image/blobs/uploads/:uuid', 'ss'],
]

const app = new koa()
const router = new koarouter();

apis.forEach(api => {
    const [m, p, h]: [string, string | RegExp, any] = api;
    if (m === 'GET') {
        router.get(p, h)
    } else if (m === 'HEAD') {
        router.head(p, h)
    }
})

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(8000, () => console.log('start'));

export default apis;

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