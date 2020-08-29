import * as stream from 'stream';
import { promisify } from 'util';
import * as crypto from 'crypto';

import * as fs from 'fs-extra';
import got from 'got';
import * as async from 'async';

import { sleep, sha256sum } from './helper';
import { storageDir, chunkSize } from './constants'

export class DownManager {
    public _down_url: string
    private chunks: { [key: number]: [number, number, number] } = {}
    public readonly layerCacheDir: string;
    public readonly layerDir: string;
    public readonly layerBlobs: string;
    constructor(readonly repo: string, readonly image: string, readonly sha256: string) {
        this._down_url = this.genDownUrl()
        this.layerDir = `${storageDir}/${repo}/${image}/${sha256}`
        this.layerCacheDir = `${this.layerDir}/cache`
        this.layerBlobs = `${this.layerDir}/blobs`
        this.initDownDirectory()
    }
    static create(repo: string, image: string, sha256: string) {
        return new DownManager(repo, image, sha256)
    }

    genDownUrl() {
        return `https://${this.repo}/v2/${this.image}/blobs/sha256:${this.sha256}`
    }

    async requestBlobsSize(): Promise<number> {
        const res = (await got.head(this._down_url))
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

    initDownDirectory() {
        fs.mkdirpSync(this.layerCacheDir)
    }

    // checkChunkDone(id: string) {
    //     return fs.existsSync(`${this.layerCacheDir}/${id}.done`)
    // }

    async scheduleWorker() {
        const q = async.queue<{ i: string, e: number, s: number }>((t, callback) => {
            async.retry({ times: 10, interval: 1000 }, (cb) => {
                DownWorker
                    .create(this, Number(t.i), t.e - t.s)
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
        if (fs.existsSync(this.layerBlobs)) {
            console.log('blobs exist')
            return
        }
        console.log('combine chunks for aaaa')
        for (const i of Object.keys(this.chunks)) {
            await appendFile(`${this.layerCacheDir}/${i}`, this.layerBlobs)
        }
        console.log('combine chunks for aaaa success')
    }

    private cleanCacheIfNeed() {
        if (fs.existsSync(this.layerCacheDir)) {
            fs.rmdirSync(`${this.layerCacheDir}`, { recursive: true })
        }
    }

    // public markSuccess(id: number) {
    //     this.chunks[id][2] = 1
    // }

    private async checkBlobssha256(sha256: string) {
        return (await sha256sum(this.layerBlobs)) === sha256
    }

    async start() {
        if (fs.existsSync(this.layerBlobs) && !(await this.checkBlobssha256(this.sha256))) {
            fs.removeSync(this.layerBlobs)
        }
        if (!fs.existsSync(this.layerBlobs)) {
            const blobsBytes = await this.requestBlobsSize()
            this.computeChunks(blobsBytes, chunkSize)
            console.log(this.chunks)
            console.debug('scheduleWorker')
            await this.scheduleWorker()
            console.debug('scheduleWorker success')
            await this.combineChunks()
        }
        const sha256 = await sha256sum(this.layerBlobs)
        console.log(this.layerBlobs)
        console.log(sha256, this.sha256)
        if (sha256 === this.sha256) {
            this.cleanCacheIfNeed()
            console.log(111)
        } else {
            await this.start()
        }
    }
}

class DownWorker {
    static create(dmgr: DownManager, id: number, inc: number) {
        return new DownWorker(dmgr, id, inc)
    }
    r_start: number
    r_end: number
    chunkDoneFile: string
    chunkFile: string
    chunkSize: number
    constructor(readonly dm: DownManager, readonly id: number, readonly inc: number) {
        this.r_start = id * chunkSize
        this.r_end = this.r_start + inc
        this.chunkSize = this.r_end - this.r_start + 1
        this.chunkDoneFile = `${this.dm.layerCacheDir}/${id}.done`
        this.chunkFile = `${this.dm.layerCacheDir}/${id}`
    }

    // try = 5

    checkDownIsNeed() {
        if (fs.existsSync(this.chunkFile) && this.checkChunkSize()) {
            return false
        }
        fs.removeSync(this.chunkFile)
        fs.removeSync(this.chunkDoneFile)
        return true
    }

    async down() {
        console.log('down check', this.r_start, this.r_end)
        if (!this.checkDownIsNeed()) {
            return
        }
        const pipeline = promisify(stream.pipeline);
        await pipeline(
            got.stream(this.dm._down_url, { headers: { Range: `bytes=${this.r_start}-${this.r_end}` } }),
            fs.createWriteStream(this.chunkFile)
        )
        console.log('logger: checkpint')
        // this.checkpoint(this.id)
        // this.dm.markSuccess(this.id)
    }

    private checkpoint(id: number) {
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

async function appendFile(input: string, output: string) {
    return new Promise((res, rej) => {
        fs.createReadStream(input).pipe(fs.createWriteStream(output, { flags: 'a' })).on('finish', () => res()).on('error', (err) => rej(err.message))
    })
}
