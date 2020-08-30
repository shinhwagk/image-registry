import * as stream from 'stream';
import { promisify } from 'util';
import * as crypto from 'crypto';

import * as fs from 'fs-extra';
import got from 'got';
import * as async from 'async';

import { sleep, sha256sum, mergeFiles as mergeChunks, mergeFile } from './helper';
import { storageDir, chunkSize } from './constants'
import * as logger from './logger'
export interface DownManagerOption {
    overlay: boolean;
}

export class DownManager {
    private chunks: { [key: number]: [number, number, number] } = {}
    public readonly cacheDest: string;
    public readonly goalFile: string;
    private readonly logger;
    constructor(private readonly url: string, private readonly dest: string, private readonly name: string, private readonly sha256: string) {
        this.cacheDest = `${this.dest}/cache`
        this.goalFile = `${this.dest}/${name}`
        this.initDirs()
        this.logger = logger.create(this.name, this.sha256.substr(0, 12))
    }
    static create(url: string, dest: string, name: string, sha256: string): DownManager {
        return new DownManager(url, dest, name, sha256)
    }
    async reqGoalSize(): Promise<number> {
        const res = (await got.head(this.url))
        return Number(res.headers['content-length'])
    }

    setStoragePaht() {

    }

    computeChunks(blobsBytes: number, split: number) {
        const chunksNumber = (blobsBytes / split >> 0) + 1
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * split
            if (chunksNumber - 1 === i) {
                this.chunks[i] = [r_start, blobsBytes, 0]
                continue
            }
            const r_end = r_start + split - 1
            this.chunks[i] = [r_start, r_end, 0]
        }
    }

    private initDirs() {
        fs.mkdirpSync(this.cacheDest)
    }

    async scheduleWorkers() {
        const q = async.queue<{ i: string, e: number, s: number }>((t, callback) => {
            async.retry({ times: 10, interval: 1000 }, (cb) => {
                DownWorker
                    .create(this.url, this.cacheDest, Number(t.i), t.e - t.s)
                    .down()
                    .then(() => cb())
                    .catch((e) => cb(e))
            }).then(() => callback()).catch((e) => callback(e))
        }, 5);

        for (const [i, [s, e]] of Object.entries(this.chunks)) {
            q.push({ i, s, e });
        }
        await q.drain();
    }

    async combineChunks() {
        if (fs.existsSync(this.goalFile)) {
            console.log('goal exist')
            return
        }
        console.log('combine chunks for aaaa')
        const chunkFiles = Object.keys(this.chunks).map((id) => `${this.cacheDest}/${id}`)
        await mergeChunks(chunkFiles, this.goalFile)
        console.log('combine chunks for aaaa success')
    }
    async mergeChunks() {
        fs.removeSync(this.goalFile)
        await mergeFile(`${this.cacheDest}/0`, this.goalFile)

        console.log('combine chunks for aaaa')
        for (const id of Object.keys(this.chunks).slice(1)) {
            await mergeFile(`${this.cacheDest}/${id}`, this.goalFile)
        }
        console.log('combine chunks for aaaa success')
    }

    private cleanCache() {
        fs.rmdirSync(`${this.cacheDest}`, { recursive: true })
    }

    // public markSuccess(id: number) {
    //     this.chunks[id][2] = 1
    // }

    private async checksha256() {
        return (await sha256sum(this.goalFile)) === this.sha256
    }

    async start() {
        const goalBytes = await this.reqGoalSize()
        this.computeChunks(goalBytes, chunkSize)
        await this.scheduleWorkers()
        await this.combineChunks()
        const sha256 = await sha256sum(this.goalFile)
        if (await this.checksha256()) {
            this.cleanCache()
        } else {
            await sleep(1000)
            await this.start()
        }
    }
}

class DownWorker {
    static create(url: string, dest: string, id: number, inc: number) {
        return new DownWorker(url, dest, id, inc)
    }
    r_start: number
    r_end: number
    chunkDoneFile: string
    chunkFile: string
    chunkSize: number
    constructor(readonly url: string, readonly dest: string, readonly id: number, readonly inc: number) {
        this.r_start = id * chunkSize
        this.r_end = this.r_start + inc
        this.chunkSize = this.r_end - this.r_start + 1
        this.chunkDoneFile = `${this.dest}/${id}.done`
        this.chunkFile = `${this.dest}/${id}`
    }

    // try = 5

    checkDown() {
        if (fs.existsSync(this.chunkDoneFile)) {
            return false
        }
        fs.removeSync(this.chunkFile)
        return true
    }

    async down() {
        console.log('down check', this.r_start, this.r_end)
        if (!this.checkDown()) {
            return
        }
        const pipeline = promisify(stream.pipeline);
        await pipeline(
            got.stream(this.url, { headers: { Range: `bytes=${this.r_start}-${this.r_end}` } }),
            fs.createWriteStream(this.chunkFile)
        )
        if (this.checkChunkSize()) {
            console.log('logger: checkpint')
            this.checkpoint()
        } else {
            throw new Error('chunk sha256 invaild ' + this.id);
        }
    }

    private checkpoint() {
        fs.writeFileSync(this.chunkDoneFile, '', { encoding: "utf-8" })
    }

    private checkChunkSize(): boolean {
        if (fs.existsSync(this.chunkFile)) {
            const stat = fs.statSync(this.chunkFile)
            return stat.size === this.chunkSize
        }
        fs.removeSync(this.chunkFile)
        fs.removeSync(this.chunkDoneFile)
        return false
    }
}

