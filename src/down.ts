import * as stream from 'stream';
import { promisify } from 'util';
import * as crypto from 'crypto';

import * as fs from 'fs-extra';
import got from 'got';

import { sleep, sha256sum } from './helper';
import { exists } from 'fs-extra';

// const split = 1 * 1024;

export class DownManager {
    public _down_url: string
    private chunks: { [key: number]: [number, number] } = {}
    public readonly layerCacheDir: string;
    public readonly layerDir: string;
    public readonly layerBlobs: string;
    constructor(readonly repo: string, readonly image: string, readonly sha256: string) {
        this._down_url = this.genDownUrl()
        this.layerDir = `test/${repo}/${image}/${sha256}`
        this.layerCacheDir = `${this.layerDir}/cache`
        this.layerBlobs = `${this.layerDir}/blobs`
        this.initDownDirectory()
    }

    genDownUrl() {
        return `https://${this.repo}/v2/${this.image}/blobs/sha256:${this.sha256}`
    }

    async requestBlobSize() {
        const res = (await got.head(this._down_url))
        return Number(res.headers['content-length'])
    }

    computeChunks(blobsBytes: number, split: number) {
        const chunksNumber = (blobsBytes / split >> 0) + 1
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * split
            if (chunksNumber - 1 === i) {
                this.chunks[i] = [r_start, blobsBytes]
                continue
            }
            const r_end = r_start + split - 1
            this.chunks[i] = [r_start, r_end]
        }
    }

    initDownDirectory() {
        fs.mkdirpSync(this.layerCacheDir)
    }

    checkChunkDone(id: string) {
        return fs.existsSync(`${this.layerCacheDir}/${id}.done`)
    }

    async scheduleWorker() {
        const x: [string, [number, number]][] = Object.entries(this.chunks)
        let pell = 10
        for (const [i, [s, e]] of x) {
            if (this.checkChunkDone(i)) {
                continue
            }
            console.log(`start ${i}`)
            pell -= 1
            const dw = DownWorker.create(this, Number(i), e - s).down()
            dw.then(_ => { pell += 1; console.log(`start ${i} done.`) })
            dw.catch(_ => { pell += 1; console.log(`start ${i} faile.`) })
            while (pell === 0) {
                await sleep(1000)
                console.log(`sleep `)
            }
        }
    }

    async combineChunks() {
        if (fs.existsSync(this.layerBlobs)) {
            console.log('blobs exist')
            return
        }
        console.log('combine chunks for aaaa')
        fs.removeSync(this.layerBlobs)
        for (const i of Object.keys(this.chunks)) {
            await appendFile(`${this.layerCacheDir}/${i}`, this.layerBlobs)
        }
        console.log('combine chunks for aaaa success')
    }

    private cleanCacheIfNeed() {
        if (fs.existsSync(this.layerCacheDir)) {
            for (const i of Object.keys(this.chunks)) {
                fs.rmdirSync(`${this.layerCacheDir}`, { recursive: true })
            }
        }
    }

    async start(split: number) {
        if (!fs.existsSync(this.layerBlobs)) {
            const blobsBytes = await this.requestBlobSize()
            this.computeChunks(blobsBytes, split)
            await this.scheduleWorker()
            await this.combineChunks()
        }
        const sha256 = await sha256sum(`${this.layerDir}/blobs`)
        console.log(sha256, this.sha256)
        if (sha256 === this.sha256) {
            this.cleanCacheIfNeed()
            console.log(111)
        } else {
            console.log("111111111")
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
    constructor(readonly dm: DownManager, readonly id: number, readonly inc: number) {
        this.r_start = id * 1024 * 1024
        this.r_end = this.r_start + inc
        this.chunkDoneFile = `${this.dm.layerCacheDir}/${id}.done`
        this.chunkFile = `${this.dm.layerCacheDir}/${id}`
    }

    async down() {
        const pipeline = promisify(stream.pipeline);
        try {
            await pipeline(
                got.stream(this.dm._down_url, { headers: { Range: `bytes=${this.r_start}-${this.r_end}` } }),
                fs.createWriteStream(this.chunkFile)
            )

            // if (this.checksize(id) === Number(r_end) - Number(r_start) + 1) {
            this.checkpoint(this.id)
            // } else {
            //     fs.removeSync(`${this.dm.cacheDir}/${id}`)
            // }

        } catch (e) {
            console.log(`id ${this.id} err ${e.message}`)
        }
    }

    private checkpoint(id: number) {
        fs.writeFileSync(this.chunkDoneFile, '', { encoding: "utf-8" })
    }

    private checksize(id: number) {
        const stat = fs.statSync(this.chunkFile)
        return stat.size
    }
}

async function appendFile(input: string, output: string) {
    return new Promise((res, rej) => {
        fs.createReadStream(input).pipe(fs.createWriteStream(output, { flags: 'a' })).on('finish', () => res()).on('error', (err) => rej(err.message))
    })
}
