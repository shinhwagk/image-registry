import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';

import got from 'got';

// const split = 1 * 1024;

class DownManager {
    public _down_url: string
    private shards: { [key: number]: [number, number] } = {}
    constructor(private readonly repo: string, readonly image: string, readonly sha256: string) {
        this._down_url = this.genDownUrl()
    }

    genDownUrl() {
        return `https://${this.repo}/v2/${this.image}/blobs/sha256:${this.sha256}`
    }

    async requestBlobSize() {
        const res = (await got.head(this._down_url))
        return Number(res.headers['content-length'])
    }

    computeShards(blobsBytes: number, split: number) {
        const shardsNumber = (blobsBytes / split >> 0) + 1
        for (let i = 0; i < shardsNumber; i++) {
            const r_start = i * split
            if (shardsNumber - 1 === i) {
                this.shards[i] = [r_start, blobsBytes]
                continue
            }
            const r_end = r_start + split - 1
            this.shards[i] = [r_start, r_end]
        }

    }

    checkDone(id: string) {
        return fs.existsSync(`test/${id}`)
    }

    success(id: string) {
        console.log(`id:${id} done.`)
    }

    async scheduleWorker() {
        const x: [string, [number, number]][] = Object.entries(this.shards)
        
        for (const [i, [s, e]] of x) {
            console.log(`id:${i} start.`)
            if (this.checkDone(i)) {
                continue
            }
            const dw = DownWorker.create(this)
             dw.download(i, s.toString(), e.toString())
        }
    }

    async start(split: number) {
        const blobsBytes = await this.requestBlobSize()
        this.computeShards(blobsBytes, split)
        await this.scheduleWorker()
    }
}

class DownWorker {
    static create(dmgr: DownManager) {
        return new DownWorker(dmgr)
    }
    constructor(readonly dm: DownManager) { }

    async download(id: string, r_start: string, r_end: string) {
        console.log()
        const pipeline = promisify(stream.pipeline);
        try {
            await pipeline(
                got.stream(this.dm._down_url, { headers: { Range: `bytes=${r_start}-${r_end}` } }),
                fs.createWriteStream(`test/${id}`)
            )
            this.dm.success(id)
        } catch (e) {
            console.log(`id ${id} err ${e.message}`)
            this.download(id, r_start, r_end)
        }
    }
}

async function appendBinbey(input: string, output: string) {
    // fs.unlinkSync('x.1.blobs')
    return new Promise((res, rej) => {
        fs.createReadStream(input).pipe(fs.createWriteStream(output, { flags: 'a' })).on('finish', () => res()).on('error', (err) => rej(err.message))
    })
}


const dm = new DownManager('quay.io', 'openshift/okd-content', '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95')
// dm.requestHEAD()
dm.start(1024)

// const pipeline = promisify(stream.pipeline);
