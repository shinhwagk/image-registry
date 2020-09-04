import * as path from 'path';

import got from 'got';
import { existsSync, mkdirpSync, rmdirSync, removeSync } from 'fs-extra';

import { chunksQueue } from './queue'
import { mergeFile, sha256sum, sleep } from '../helper';
import { chunkSize } from '../constants'
import { DownTaskChunk } from './chunk';
import { ReqHeader, AbsState, TaskState } from './types';
import * as logger from '../logger'
import { Logger } from 'winston';

export class DownTask extends AbsState {

    private readonly id: string;
    private readonly log: Logger;
    private blobsBytes = 0;
    private readonly blobsFile: string;
    private readonly cacheDest: string;
    private chunks: DownTaskChunk[] = []

    constructor(
        public readonly url: string,
        public readonly dest: string,
        private readonly name: string,
        private readonly sha256: string,
        public readonly auth?: string
    ) {
        super()
        this.blobsFile = path.join(dest, 'blobs');
        this.cacheDest = path.join(dest, 'cache');
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
        const headers: ReqHeader = this.auth ? { 'authorization': this.auth } : {}
        const res = (await got.head(this.url, { headers }))
        this.blobsBytes = Number(res.headers['content-length'])
    }

    private makeChunks(): void {
        const chunksNumber = (this.blobsBytes / chunkSize >> 0) + 1
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * chunkSize
            if (chunksNumber - 1 === i) {
                this.chunks.push(DownTaskChunk.create(this.getId() + '@chunk:' + i.toString(), i.toString(), this.url, this.auth, this.cacheDest, r_start, this.blobsBytes - 1))
                continue
            }
            const r_end = r_start + chunkSize - 1
            this.chunks.push(DownTaskChunk.create(this.getId() + '@chunk:' + i.toString(), i.toString(), this.url, this.auth, this.cacheDest, r_start, r_end))
        }
    }

    private cleanBlobs(): void {
        removeSync(this.blobsFile)
    }

    private async combineChunks(): Promise<void> {
        this.cleanBlobs()
        for (const cf of Object.keys(this.chunks).map((id) => path.join(this.cacheDest, id))) {
            await mergeFile(cf, this.blobsFile)
        }
        this.log.info(this.id + ' combine chunks success.')
    }

    private cleanCache() {
        rmdirSync(this.cacheDest, { recursive: true })
    }

    private async checkBlobsShasum(): Promise<boolean> {
        return await sha256sum(this.blobsFile) === this.sha256
    }

    private checkIsDown(): boolean {
        if (existsSync(this.blobsFile)) {
            if (this.checkBlobsShasum()) {
                return false
            }
        }
        return true
    }

    private checkTasksState(state: TaskState): AbsState[] {
        return this.chunks.filter(c => c.checkState(state))
    }

    async start(): Promise<void> {
        this.setState('running')
        this.log.info('start')
        if (!this.checkIsDown()) {
            this.log.info('blobs exist')
            return
        }
        await this.reqBlobsSize()
        this.mkdirCacheDest()
        this.makeChunks()
        chunksQueue.push(this.chunks.map(task => { return { task } }))
        while (this.checkTasksState('none').length >= 1 || this.checkTasksState('running').length >= 1) {
            console.log('queue length' + chunksQueue.length() + ' ' + chunksQueue.running())
            await sleep(5000)
        }
        if (this.chunks.filter(c => c.checkState('failure')).length >= 1) {
            this.setState('failure')
            return;
        }
        await this.combineChunks()
        if (this.checkBlobsShasum()) {
            this.log.info('blobs sha256sum ok')
            this.cleanCache()
            this.setState('success')
        } else {
            this.log.info('blobs sha256sum faile')
            this.cleanBlobs()
            this.setState('failure')
        }
    }
}
