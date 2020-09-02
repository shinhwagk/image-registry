import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
import { Logger } from 'winston';

import * as log from '../logger'
import { ReqHeader } from './types';

export class DownTaskChunk {
    public static create(id: string,
        url: string,
        auth: string | undefined = undefined,
        dest: string,
        r_start: number,
        r_end: number): DownTaskChunk {
        return new DownTaskChunk(id, url, auth, dest, r_start, r_end)
    }

    private readonly chunkDoneFile: string
    private readonly chunkFile: string
    private readonly chunkSize: number
    private readonly logger: Logger
    private readonly headers: ReqHeader = {}

    constructor(
        private readonly id: string,
        private readonly url: string,
        private readonly auth: string | undefined = undefined,
        private readonly dest: string,
        private readonly r_start: number,
        private readonly r_end: number
    ) {
        this.chunkSize = r_end - r_start + 1;
        this.chunkFile = path.join(this.dest, this.id)
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
        this.setHeaders()
        await promisify(stream.pipeline)(
            got.stream(this.url, { headers: this.headers }),
            fs.createWriteStream(this.chunkFile)
        )
        if (this.checkChunkSize()) {
            this.checkpoint()
        } else {
            fs.removeSync(this.chunkFile)
            throw new Error('chunk size invaild ' + this.id);
        }
    }

    private checkpoint() {
        fs.writeFileSync(this.chunkDoneFile, '', { encoding: "utf-8" })
    }

    private checkChunkSize(): boolean {
        const stat = fs.statSync(this.chunkFile)
        return stat.size === this.chunkSize
    }
}