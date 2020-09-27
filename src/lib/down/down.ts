import * as path from 'path';

import got from 'got';
import { existsSync, mkdirpSync, rmdirSync, removeSync } from 'fs-extra';
import { Logger } from 'winston';

import { chunksQueue } from './queue'
import { mergeFile, sha256sum, sleep } from '../helper';
import { chunkSize } from '../constants'
import { DownTaskChunk } from './chunk';
import { ReqHeader } from './types';
import * as logger from './logger'

export class DownTask {

    private readonly id: string;
    private readonly log: Logger;
    private blobsBytes = 0;
    private readonly cacheDest: string;
    private chunks: DownTaskChunk[] = []

    constructor(
        public readonly url: string,
        public readonly destFile: string,
        private readonly name: string,
        private readonly sha256: string,
        public readonly auth?: string
    ) {
        this.cacheDest = path.join('/tmp', name, 'cache');
        this.id = this.getId()
        this.log = logger.create(`DownTask ${this.id}`)
    }

    getId(): string {
        return this.name + '@sha256:' + this.sha256.substr(0, 12)
    }

    private mkdirCacheDest() {
        mkdirpSync(this.cacheDest)
    }

    private async reqBlobsSize(): Promise<void> {
        const headers: ReqHeader = this.auth ? { 'authorization': `Bearer ${this.auth}` } : {}
        const res = (await got.head(this.url, { headers }))
        this.blobsBytes = Number(res.headers['content-length'])
    }

    private makeChunks(): void {
        const cs = Number(chunkSize)
        const chunksNumber = (this.blobsBytes / cs >> 0) + 1
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * cs
            if (chunksNumber - 1 === i) {
                this.chunks.push(DownTaskChunk.create(this.getId() + '@chunk:' + i.toString(), i.toString(), this.url, this.auth, this.cacheDest, r_start, this.blobsBytes - 1))
                continue
            }
            const r_end = r_start + cs - 1
            this.chunks.push(DownTaskChunk.create(this.getId() + '@chunk:' + i.toString(), i.toString(), this.url, this.auth, this.cacheDest, r_start, r_end))
        }
    }

    private cleanBlobs(): void {
        removeSync(this.destFile)
    }

    private async combineChunks(): Promise<void> {
        this.cleanBlobs()
        for (const cf of Object.keys(this.chunks).map((id) => path.join(this.cacheDest, id))) {
            await mergeFile(cf, this.destFile)
        }
        this.log.info(this.id + ' combine chunks success.')
    }

    private cleanCache() {
        rmdirSync(this.cacheDest, { recursive: true })
    }

    private async checkBlobsShasum(): Promise<boolean> {
        return await sha256sum(this.destFile) === this.sha256
    }

    private checkIsDown(): boolean {
        if (existsSync(this.destFile)) {
            if (this.checkBlobsShasum()) {
                return false
            }
        }
        return true
    }

    async start(): Promise<void> {
        this.log.info('start')
        if (!this.checkIsDown()) {
            this.log.info('blobs exist')
            return
        }
        await this.reqBlobsSize()
        this.mkdirCacheDest()
        this.makeChunks()
        const succes: number[] = []
        for (const task of this.chunks) {
            chunksQueue.push({ task }, (err) => {
                if (err) {
                    succes.push(0)
                } else {
                    succes.push(1)
                }
            })
        }
        while (succes.length !== this.chunks.length) {
            await sleep(5000)
        }
        if (succes.filter(s => s === 0).length >= 1) {
            throw new Error('down error')
        }

        console.log("ssssssssssssssssssss")

        // await this.combineChunks()
        // if (this.checkBlobsShasum()) {
        //     this.log.info('blobs sha256sum ok')
        //     this.cleanCache()
        // } else {
        //     this.log.info('blobs sha256sum faile')
        //     this.cleanBlobs()
        // }
    }
}
