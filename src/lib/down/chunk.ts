import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
import { Logger } from 'winston';

import * as logger from './logger'
import { ReqHeader, ITask } from './types';
// import { agent } from '../constants';

export class DownTaskChunk implements ITask {
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
    private readonly log: Logger;
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
        this.size = r_end - r_start + 1;
        this.chunk = path.join(this.dest, this.seq)
        this.log = logger.create(`DownTaskChunk ${this.id}`)
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
        this.log.debug('start')
        if (!this.checkIsDown()) {
            return
        }
        this.setHeaders()
        const pipeline = promisify(stream.pipeline);
        const source = got.stream(this.url, { headers: this.headers, timeout: 20 * 1000 })//, agent: agent
            .on('request', request => setTimeout(() => request.destroy(), 30 * 1000));
        const target = fs.createWriteStream(this.chunk)
        await pipeline(source, target)
        if (this.checkExist()) {
            if (this.checkValid()) {
                this.log.info('done')
                return
            } else {
                this.remove()
            }
        }
        throw new Error('valid failure')
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
