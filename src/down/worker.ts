import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
import { Logger } from 'winston';

import * as log from '../logger'
import { ReqHeader } from './types';

export class DownWorker {
    chunkDoneFile: string
    chunkFile: string
    chunkSize: number
    logger: Logger
    headers: ReqHeader = {}
    constructor(private readonly id: string, private readonly url: string, private readonly auth: string | undefined, private dest: string, private readonly r_start: number, private readonly r_end: number) {
        this.chunkSize = r_start - r_end + 1
        this.chunkFile = path.join(dest, this.id)
        this.chunkDoneFile = path.join(this.chunkFile + '.done')
        this.logger = log.create('a')
    }

    checkDown(): boolean {
        if (fs.existsSync(this.chunkDoneFile)) {
            return false
        }
        fs.removeSync(this.chunkFile)
        return true
    }

    setHeaders(): void {
        this.headers['Range'] = `bytes=${this.r_start}-${this.r_end}`
        if (this.auth) {
            this.headers['authorization'] = this.auth
        }
    }

    async down(): Promise<void> {
        if (!this.checkDown()) {
            return
        }
        const pipeline = promisify(stream.pipeline);
        this.setHeaders()
        console.log(this.headers)
        await pipeline(
            got.stream(this.url, { headers: this.headers }),
            fs.createWriteStream(this.chunkFile)
        )
        if (this.checkChunkSize()) {
            this.checkpoint()
        } else {
            throw new Error('chunk size invaild ' + this.id);
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