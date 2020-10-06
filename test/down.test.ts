import * as assert from 'assert'

import { mkdirpSync, removeSync, rmdirSync, statSync } from "fs-extra"

import { DownTask, DownTaskConfig } from '../src/down/down'
import { sha256sumOnFile, sleep } from '../src/helper'
import { DownTaskChunk, DownTaskChunkConfig } from "../src/down/chunk"
import { DownMangerService } from '../src/down/manager'
import { RegistryClient } from '../src/client'
import { DistributionFS } from '../src/storage'

describe('down', () => {
    const dest = 'storage'
    beforeEach(() => {
        mkdirpSync(dest)
    });

    afterEach(() => {
        rmdirSync(dest, { recursive: true })
    });

    describe('chunk', async () => {
        it('test', async () => {
            const dtcc: DownTaskChunkConfig = { id: "", seq: 0, url: 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', dest, size: 20, headers: { range: 'bytes=0-19' } }
            const twc = new DownTaskChunk(dtcc)
            await twc.start()
            assert.strictEqual(statSync('storage/0').size, dtcc.size)
        }).timeout(60 * 1000)
    })

    describe('down', async () => {
        it('test', async () => {
            const url = 'https://quay.io/v2/outline/shadowbox/blobs/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f'
            const config: DownTaskConfig = {
                name: "outline/shadowbox",
                url,
                fname: 'sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f',
                dest,
                cacheDest: 'storage/cache',
                sha256: '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f',
                headers: {}
            }
            const tw = new DownTask(config)
            await tw.start()
            const sha = await sha256sumOnFile(`storage/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f`)
            assert.strictEqual(sha, '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f');
        }).timeout(60 * 1000)
    })

    describe('down', async () => {
        it('manager', async () => {
            const url = 'https://quay.io/v2/outline/shadowbox/blobs/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f'
            const config = {
                name: "outline/shadowbox",
                url,
                fname: 'sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f',
                dest,
                cacheDest: 'storage/cache',
                sha256: '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f',
                headers: {}
            }
            for (let i = 0; i <= 10; i++) {
                DownMangerService.addTask(config)
            }
            await Promise.all([DownMangerService.wait(config), DownMangerService.wait(config)]);
            await sleep(5000)
            await Promise.all([DownMangerService.wait(config), DownMangerService.wait(config)]);
            const sha = await sha256sumOnFile(`storage/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f`)
            assert.strictEqual(sha, '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f');
        }).timeout(60 * 1000)
    })
})


describe('client', () => {
    it("", async () => {
        const d = new DistributionFS(`quay.io/outline/shadowbox`)
        const rc = new RegistryClient('quay.io', 'outline/shadowbox', d)
        await rc.gotManifest('server-2020-09-28')
        assert.strictEqual(1, 1)
    }).timeout(60 * 1000)
})