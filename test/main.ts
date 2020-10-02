import chunk from './down/chunk.test'
import down from './down/down.test'
import manager from './down/manager.test'
import client from './client.test'
import { sha256sumOnFile, sleep } from '../src/lib/helper'
import got from 'got/dist/source'
import * as assert from 'assert'
import { createReadStream, createWriteStream, existsSync, mkdirpSync } from 'fs-extra'

// (async () => {
//     for (const unitTest of []
//         // .concat(chunk)
//         // .concat(down)
//         // .concat(manager)
//         .concat(client)
//     ) {
//         await unitTest()
//     }
// })()


it('should do something', async () => {
    await sleep(6000)
}).timeout(7000)

describe('http test', function () {
    it('get blobs', async () => {
        mkdirpSync('notes/test')
        got.stream('http://127.0.0.1:8003/v2/proxy/quay.io/outline/shadowbox/blobs/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f').pipe(createWriteStream('./notes/test/blobs')).on('finish', async () => assert.strictEqual(await sha256sumOnFile('./notes/test/blobs'), '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f'))
    }).timeout(60 * 1000)

    it('head blobs', async () => {
        const res = await got.head('http://127.0.0.1:8003/v2/proxy/quay.io/outline/shadowbox/blobs/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f', { throwHttpErrors: false })
        console.log(res.statusCode)
        assert.strictEqual(res.statusCode, 200)
    }).timeout(60 * 1000)
})