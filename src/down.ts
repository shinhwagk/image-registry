import * as stream from 'stream';
import { promisify } from 'util';

import * as fs from 'fs-extra';
import got from 'got';
import * as async from 'async';
import { Logger } from 'winston'

import { sleep, sha256sum, mergeFile } from './helper';
import { chunkSize } from './constants'
import * as logger from './logger'

export interface DownManagerOption {
    overlay: boolean;
}

export class DownManager {
    private chunks: { [key: number]: [number, number, number] } = {}
    public readonly cacheDest: string;
    public readonly goalFile: string;
    constructor(private readonly url: string, private readonly dest: string, name: string, private readonly sha256: string, private readonly logger: Logger) {
        this.cacheDest = `${this.dest}/cache`
        this.goalFile = `${this.dest}/${name}`
    }
    static create(url: string, dest: string, name: string, goalName: string, sha256: string): DownManager {
        const l = logger.create('DownManager' + ' ' + name + ' ' + sha256.substr(0, 12))
        return new DownManager(url, dest, goalName, sha256, l)
    }
    async reqGoalSize(): Promise<number> {
        const res = (await got.head(this.url))
        return Number(res.headers['content-length'])
    }

    // setStoragePaht() {

    // }

    computeChunks(blobsBytes: number): void {
        const chunksNumber = (blobsBytes / chunkSize >> 0) + 1
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * chunkSize
            if (chunksNumber - 1 === i) {
                this.chunks[i] = [r_start, blobsBytes - 1, 0]
                continue
            }
            const r_end = r_start + chunkSize - 1
            this.chunks[i] = [r_start, r_end, 0]
        }
    }

    private initDirs() {
        fs.mkdirpSync(this.cacheDest)
    }

    async scheduleWorkers(): Promise<void> {
        let successes = 0
        const q = async.queue<{ i: string, e: number, s: number }>((t, callback) => {
            async.retry({ times: 10, interval: 1000 }, (cb) => {
                DownWorker
                    .create(this.url, this.cacheDest, Number(t.i), t.e - t.s)
                    .down()
                    .then(() => cb())
                    .catch((e) => cb(e))
            }).then(() => callback()).catch((e) => callback(e))
        }, 10);

        for (const [i, [s, e]] of Object.entries(this.chunks)) {
            q.push({ i, s, e }, (err) => {
                if (!err) {
                    successes += 1
                    this.logger.info(`progress: ${successes}/${Object.keys(this.chunks).length}`)
                }
            });
        }
        await q.drain();
    }

    async combineChunks(): Promise<void> {
        this.cleanGoal()
        for (const cf of Object.keys(this.chunks).map((id) => `${this.cacheDest}/${id}`)) {
            await mergeFile(cf, this.goalFile)
        }
        this.logger.info('combine chunks success.')
    }

    private cleanGoal() {
        fs.removeSync(`${this.goalFile}`)
    }
    private cleanCache() {
        fs.rmdirSync(`${this.cacheDest}`, { recursive: true })
    }

    // public markSuccess(id: number) {
    //     this.chunks[id][2] = 1
    // }

    private async checksha256() {
        const goalSha256 = await sha256sum(this.goalFile)
        this.logger.info(`sha256: ${goalSha256.substr(0, 12)} - ${this.sha256.substr(0, 12)}`)
        return (goalSha256) === this.sha256
    }

    async start(): Promise<void> {
        this.logger.info('start')
        this.initDirs()
        const goalBytes = await this.reqGoalSize()
        this.logger.info(`size: ${goalBytes}`)
        this.computeChunks(goalBytes)
        this.logger.info(`chunks: ${Object.keys(this.chunks).length}`)
        await this.scheduleWorkers()
        await this.combineChunks()
        if (await this.checksha256()) {
            this.cleanCache()
        } else {
            await sleep(1000)
            this.logger.info(`retry.`)
            await this.start()
        }
        this.logger.info('success')
    }
}

class DownWorker {
    static create(url: string, dest: string, id: number, size: number = chunkSize) {
        return new DownWorker(url, dest, id, size)
    }
    r_start: number
    r_end: number
    chunkDoneFile: string
    chunkFile: string
    chunkSize: number
    constructor(readonly url: string, readonly dest: string, readonly id: number, readonly size: number) {
        this.r_start = id * chunkSize
        this.r_end = this.r_start + size
        this.chunkSize = this.r_end - this.r_start + 1
        this.chunkDoneFile = `${this.dest}/${id}.done`
        this.chunkFile = `${this.dest}/${id}`
    }

    checkDown() {
        if (fs.existsSync(this.chunkDoneFile)) {
            return false
        }
        fs.removeSync(this.chunkFile)
        return true
    }

    async down() {
        if (!this.checkDown()) {
            return
        }
        const pipeline = promisify(stream.pipeline);
        await pipeline(
            got.stream(this.url, { headers: { Range: `bytes=${this.r_start}-${this.r_end}` } }),
            fs.createWriteStream(this.chunkFile)
        )
        if (this.checkChunkSize()) {
            this.checkpoint()
        } else {
            throw new Error('chunk sha256 invaild ' + this.id);
        }
    }

    private checkpoint() {
        fs.writeFileSync(this.chunkDoneFile, '', { encoding: "utf-8" })
    }

    private checkChunkSize(): boolean {
        const stat = fs.statSync(this.chunkFile)
        if (stat.size === this.chunkSize) { return true; }
        fs.removeSync(this.chunkFile)
        return false
    }
}

