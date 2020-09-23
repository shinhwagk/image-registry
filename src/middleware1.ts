import Router from 'koa-router'

export const _patch_blobs: Router.IMiddleware = (ctx: Router.IRouterContext, next: () => Promise<any>) => {
    ctx.params
    const name = ctx.params[0]
    const uid = ctx.params[1]
    // view.push("==============================")
    // view.push(req.method + " " + req.url)
    // view.push(JSON.stringify(req.headers))
    // view.push("==============================")
    mkdirpSync(`notes/test/${name}/blobs/cache`)
    const writeStream = createWriteStream(`notes/test/${name}/blobs/cache/${uid}`);
    ctx.req.pipe(writeStream).on('finish', () => {
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

}

export const _post_blobs: Router.IMiddleware = (ctx: Router.IRouterContext, next: () => Promise<any>) => {
    ctx.params

}

export const _head_blobs: Router.IMiddleware = (ctx: Router.IRouterContext, next: () => Promise<any>) => {

}

export const _head_manifests: Router.IMiddleware = (ctx: Router.IRouterContext, next: () => Promise<any>) => {

}

export const _put_blobs: Router.IMiddleware = (ctx: Router.IRouterContext, next: () => Promise<any>) => {

}

export const _put_manifests: Router.IMiddleware = (ctx: Router.IRouterContext, next: () => Promise<any>) => {

}

export const _get_manifests: Router.IMiddleware = (ctx: Router.IRouterContext, next: () => Promise<any>) => {

}

export const _get_blobs: Router.IMiddleware = (ctx: Router.IRouterContext, next: () => Promise<any>) => {

}