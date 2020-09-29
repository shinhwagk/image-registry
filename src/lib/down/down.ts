import * as path from 'path';

import got from 'got';
import { existsSync, mkdirpSync, rmdirSync, removeSync } from 'fs-extra';
import { Logger } from 'winston';

import { chunksQueue } from './queue'
import { mergeFile, sha256sumOnFile } from '../helper';
import { envDownChunkSize } from '../constants'
import { DownTaskChunk } from './chunk';
import { ReqHeader } from '../types';
import * as logger from '../logger'

export interface DownTaskConfig {
    readonly name: string;
    readonly url: string;
    readonly fname: string;
    readonly dest: string;
    readonly cacheDest: string;
    readonly sha256: string;
    readonly auth?: string;
}

export class DownTask {

    private readonly id: string;
    private readonly log: Logger;
    private blobsBytes = 0;
    private chunks: DownTaskChunk[] = []
    private destFile: string;

    constructor(public readonly c: DownTaskConfig) {
        this.id = this.getId()
        this.log = logger.create(`DownTask ${this.id}`)
        this.destFile = path.join(this.c.dest, this.c.fname)
    }

    getId(): string {
        return this.c.name + '@sha256:' + this.c.sha256.substr(0, 12)
    }

    private mkdirDests() {
        console.log(this.c.dest, this.c.cacheDest)
        mkdirpSync(this.c.dest)
        mkdirpSync(this.c.cacheDest)
    }

    private async reqBlobsSize(): Promise<void> {
        const headers: ReqHeader = this.c.auth ? { 'authorization': this.c.auth } : {}
        const res = (await got.head(this.c.url, { headers }))
        this.blobsBytes = Number(res.headers['content-length'])

    }

    private makeChunks(): void {
        const cs = Number(envDownChunkSize)
        const chunksNumber = (this.blobsBytes / cs >> 0) + 1
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * cs
            if (chunksNumber - 1 === i) {
                this.chunks.push(DownTaskChunk.create(this.getId() + '@chunk:' + i.toString(), i.toString(), this.c.url, this.c.auth, this.c.cacheDest, r_start, this.blobsBytes - 1))
                continue
            }
            const r_end = r_start + cs - 1
            this.chunks.push(DownTaskChunk.create(this.getId() + '@chunk:' + i.toString(), i.toString(), this.c.url, this.c.auth, this.c.cacheDest, r_start, r_end))
        }
    }

    private cleanBlobs(): void {
        removeSync(this.destFile)
    }

    private async combineChunks(): Promise<void> {
        this.cleanBlobs()
        this.log.info(this.id + " combineChunks")
        for (const cf of Object.keys(this.chunks)
            .map((id) => path.join(this.c.cacheDest, id))) {
            await mergeFile(cf, this.destFile)
        }
        this.log.info(this.id + ' combine chunks success.')
    }

    private cleanCache() {
        rmdirSync(this.c.cacheDest, { recursive: true })
    }

    private async checkBlobsShasum(): Promise<boolean> {
        return await sha256sumOnFile(this.destFile) === this.c.sha256
    }

    private async checkIsDown(): Promise<boolean> {
        if (existsSync(this.destFile) && await this.checkBlobsShasum()) {
            return false
        }
        return true
    }

    async start(): Promise<void> {
        this.log.info('start')
        if (!(await this.checkIsDown())) {
            this.log.info('blobs exist and vaild.')
            return
        }
        this.mkdirDests()
        await this.reqBlobsSize()
        this.makeChunks()
        const execChunks = this.chunks.map(chunk => {
            return new Promise<void>((res, rej) => {
                chunksQueue.push({ task: chunk }, (e) => {
                    if (e) {
                        rej(e.message)
                    } else {
                        res()
                    }
                })
            })
        })
        try {
            await Promise.all(execChunks)
            await this.combineChunks()
            console.log("blobs sha256sum ok")
            this.log.info('blobs sha256sum ok')
        } finally {
            this.log.info('end')
            this.cleanCache()
        }
    }
}
