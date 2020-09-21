const koa = require('koa')
const koarouter = require('koa-router')

const k = new koa()
const kr = new koarouter()

kr.get(/abccccababccccab/, (ctx) => ctx.body = "all")
kr.get(/^\/ab.*?ab$/, (ctx) => ctx.body = "abaall")
kr.get(/ab.*abab.*ab/, (ctx) => ctx.body = "ab1")
kr.get(/(.*)/, (ctx) => ctx.body = "all")



k.use(kr.routes())
k.listen(8000, () => console.log("start"))