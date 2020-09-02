import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
import * as async from 'async';
// import { Logger } from 'winston'

import { mergeFile, sha256sum } from '../helper';
import { chunkSize } from '../constants'
import { DownTaskChunk } from './chunk';
import { existsSync } from 'fs-extra';
import { ReqHeader, TaskState } from './types';

// type ReqHeader = NodeJS.Dict<string | string[]>;


export class DownTask {
    private blobsBytes = 0;
    private chunks: { [key: number]: [number, number] } = {};
    private readonly blobsFile: string;
    private readonly cacheDest: string;

    private state: TaskState = 'none';

    constructor(
        public readonly url: string,
        public readonly dest: string,
        private readonly name: string,
        private readonly sha256: string,
        public readonly auth?: string
    ) {
        this.blobsFile = path.join(dest, 'blobs');
        this.cacheDest = path.join(dest, 'cache');
    }

    checkState(state: TaskState): boolean {
        return this.state === state;
    }

    setState(state: TaskState): void {
        this.state = state
    }

    getId(): string {
        return this.name + '@' + this.sha256.substr(0, 12)
    }

    private mkdirCacheDest() {
        fs.mkdirpSync(this.cacheDest)
    }

    private async reqBlobsSize(): Promise<void> {
        const headers: ReqHeader = { 'accept-encoding': 'gzip' }
        if (this.auth) {
            headers['authorization'] = this.auth
        }
        const res = (await got.head(this.url, { headers }))
        this.blobsBytes = Number(res.headers['content-length'])
    }

    private async makeChunks(): Promise<void> {
        const chunksNumber = (this.blobsBytes / chunkSize >> 0) + 1
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * chunkSize
            if (chunksNumber - 1 === i) {
                this.chunks[i] = [r_start, this.blobsBytes - 1]
                continue
            }
            const r_end = r_start + chunkSize - 1
            this.chunks[i] = [r_start, r_end]
        }
    }

    private cleanBlobs(): void {
        fs.removeSync(this.blobsFile)
    }

    private async combineChunks(): Promise<void> {
        this.cleanBlobs()
        for (const cf of Object.keys(this.chunks).map((id) => path.join(this.cacheDest, id))) {
            await mergeFile(cf, this.blobsFile)
        }
        console.info('combine chunks success.')
    }

    // setState() {
    //     this.start =''
    // }
    private cleanCache() {
        fs.rmdirSync(this.cacheDest, { recursive: true })
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

    async start(): Promise<void> {
        console.log('task start')
        if (!this.checkIsDown()) {
            console.log(`blobs exist`)
            return
        }
        await this.reqBlobsSize()
        this.mkdirCacheDest()
        this.makeChunks()

        for (const [id, [start, end]] of Object.entries(this.chunks)) {
            const chunk = DownTaskChunk.create(id, this.url, this.auth, this.cacheDest, start, end)
            chunksQueue.push({ chunk }, (err) => {
                if (err) {
                    console.log(`${id} done ${err}`)
                }
            })
        }
        await chunksQueue.drain()
        await this.combineChunks()
        if (this.checkBlobsShasum()) {
            this.cleanCache()
        } else {
            this.cleanBlobs()
        }
    }
}

const chunksQueue = makeChunksQueue()

function makeChunksQueue() {
    return async.queue<{ chunk: DownTaskChunk }>(({ chunk }, callback) => {
        async.retry({ times: 10, interval: 1000 }, (cb) => {
            chunk.down()
                .then(() => cb())
                .catch((e) => { console.log(`worker error ${e.message} xxxxxxxxxxxx`); cb(e.message) })
        }).then(() => callback()).catch((e) => callback(e.message))
    }, 10);
}
