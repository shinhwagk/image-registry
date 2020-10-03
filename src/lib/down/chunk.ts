import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';
import * as http from 'http';

import * as fs from 'fs-extra';
import got from 'got';
import { Logger } from 'winston';

import * as logger from '../logger'
import { ITask } from '../types';
// import { agent } from '../constants';

export interface DownTaskChunkConfig {
    id: string,
    seq: string,
    url: string,
    headers: http.IncomingHttpHeaders,
    dest: string, size: number
}

export class DownTaskChunk implements ITask {
    private readonly chunk: string
    private readonly log: Logger;

    constructor(
        public readonly c: DownTaskChunkConfig
    ) {
        this.chunk = path.join(this.c.dest, this.c.seq)
        this.log = logger.create(`DownTaskChunk ${this.c.id}`)
    }

    checkIsDown(): boolean {
        if (this.checkExist() && this.checkValid()) {
            return false
        }
        this.remove()
        return true
    }

    async start(): Promise<void> {
        this.log.debug('start')
        if (!this.checkIsDown()) {
            return
        }
        const pipeline = promisify(stream.pipeline);
        const source = got.stream(this.c.url, { headers: this.c.headers, timeout: 20 * 1000 })//, agent: agent
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
        return fs.statSync(this.chunk).size === this.c.size
    }

}
