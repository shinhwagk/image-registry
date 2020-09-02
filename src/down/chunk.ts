import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
// import { Logger } from 'winston';

// import * as log from '../logger'
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

    // private readonly chunkDoneFile: string
    private readonly chunk: string
    private readonly size: number
    // private readonly logger: Logger
    private readonly headers: ReqHeader = {}

    constructor(
        private readonly id: string,
        private readonly url: string,
        private readonly auth: string | undefined = undefined,
        private readonly dest: string,
        private readonly r_start: number,
        private readonly r_end: number
    ) {
        this.size = r_end - r_start + 1;
        this.chunk = path.join(this.dest, this.id)
        // this.chunkDoneFile = path.join(this.chunkFile + '.done')
        // this.logger = log.create('a')
    }

    checkIsDown(): boolean {
        if (this.checkExist() && this.checkValid()) {
            return false
        }
        this.remove()
        return true
    }

    setHeaders(): void {
        this.headers['Range'] = `bytes=${this.r_start}-${this.r_end}`
        if (this.auth) {
            this.headers['authorization'] = this.auth
        }
    }

    async down(): Promise<void> {
        console.log('down：')
        if (!this.checkIsDown()) {
            return
        }
        this.setHeaders()
        await promisify(stream.pipeline)(
            got.stream(this.url, { headers: this.headers }),
            fs.createWriteStream(this.chunk)
        )
        if (this.checkExist()) {
            if (!this.checkValid()) {
                this.remove()
                throw new Error('chunk size invaild ' + this.id + ' ' + `${this.r_end - this.r_start + 1}`);
            }
        }
    }

    private remove() {
        fs.removeSync(this.chunk)
    }

    private checkExist(): boolean {
        return fs.existsSync(this.chunk)
    }

    private checkValid(): boolean {
        return fs.statSync(this.chunk).size === this.size
    }

}