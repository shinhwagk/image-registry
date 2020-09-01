import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
import * as async from 'async';
// import { Logger } from 'winston'

import { mergeFile } from '../helper';
import { chunkSize } from '../constants'

type ReqHeader = NodeJS.Dict<string | string[]>;

export class DownTask {
    private blobsBytes = 0;
    private chunks: { [key: number]: [number, number, number] } = {};
    public readonly cacheDest: string;
    private readonly blobsFile: string;
    constructor(public readonly url: string,
        public readonly dest: string,
        private readonly name: string,
        private readonly sha256: string,
        public readonly auth?: string) {
        this.cacheDest = this.getCacheDest();
        this.blobsFile = path.join(dest, 'blobs');
    }

    getId(): string {
        return this.name + '@' + this.sha256.substr(0, 12)
    }

    private getCacheDest() {
        return path.join(this.dest, 'cache')
    }

    async reqBlobsSize(t: DownTask): Promise<void> {
        const headers: { [key: string]: string } = {}
        if (t.auth) {
            headers['authorization'] = t.auth
        }
        const res = (await got.head(t.url, { headers }))
        this.blobsBytes = Number(res.headers['content-length'])
    }

    async makeChunks(): Promise<void> {
        const chunksNumber = (this.blobsBytes / chunkSize >> 0) + 1
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * chunkSize
            if (chunksNumber - 1 === i) {
                this.chunks[i] = [r_start, this.blobsBytes - 1, 0]
                continue
            }
            const r_end = r_start + chunkSize - 1
            this.chunks[i] = [r_start, r_end, 0]
        }
    }

    cleanBlobs() {
        fs.removeSync(this.blobsFile)
    }

    async combineChunks(): Promise<void> {
        this.cleanBlobs()
        for (const cf of Object.keys(this.chunks).map((id) => `${this.cacheDest}/${id}`)) {
            await mergeFile(cf, this.blobsFile)
        }
        // this.logger.info('combine chunks success.')
    }

    // setState() {
    //     this.start =''
    // }

    async start() {
        this.makeChunks()
        const chunkWorkers = makeChunkWorkers()
        for (const [id, [start, end]] of Object.entries(this.chunks)) {
            chunkWorkers.push({ id, url: this.url, auth: this.auth, dest: this.cacheDest, r_start: start, r_end: end })
        }
        await chunkWorkers.drain()
        await this.combineChunks()
    }
}
function makeChunkWorkers() {
    return async.queue<{ id: string, url: string, auth: string | undefined, dest: string, r_start: number, r_end: number }>((t, callback) => {
        async.retry({ times: 10, interval: 1000 }, (cb) => {
            DownWorker
                .create(t.id, t.url, t.auth, t.dest, t.r_start, t.r_end)
                .down()
                .then(() => cb())
                .catch((e) => { console.log(`worker error ${e}`); cb(e) })
        }).then(() => callback()).catch((e) => callback(e))
    }, 10);
}

