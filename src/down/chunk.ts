import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
// import { Logger } from 'winston';

// import * as log from '../logger'
import { ReqHeader, AbsState, ITask } from './types';

export class DownTaskChunk extends AbsState implements ITask {
    public static create(
        id: string,
        seq: string,
        url: string,
        auth: string | undefined = undefined,
        dest: string,
        r_start: number,
        r_end: number): DownTaskChunk {
        return new DownTaskChunk(id, seq, url, auth, dest, r_start, r_end)
    }

    private readonly chunk: string
    private readonly size: number
    // private readonly logger: Logger
    private readonly headers: ReqHeader = {}


    constructor(
        public readonly id: string,
        private readonly seq: string,
        private readonly url: string,
        private readonly auth: string | undefined = undefined,
        private readonly dest: string,
        private readonly r_start: number,
        private readonly r_end: number
    ) {
        super()
        this.size = r_end - r_start + 1;
        this.chunk = path.join(this.dest, this.seq)
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

    async start(): Promise<void> {
        console.log('down：', this.id)
        if (!this.checkIsDown()) {
            this.setState('success')
            return
        }
        this.setState('running')
        this.setHeaders()
        await promisify(stream.pipeline)(
            got.stream(this.url, { headers: this.headers }),
            fs.createWriteStream(this.chunk)
        )
        if (this.checkExist()) {
            if (!this.checkValid()) {
                this.remove()
                this.setState('failure')
                console.log(`${this.id} failure`)
                // throw new Error(this.id + ' chunk size invaild ' + this.seq + ' ' + `${this.r_end - this.r_start + 1}`);
            }
        }
        console.log(`${this.id} done`)
        this.setState('success')
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