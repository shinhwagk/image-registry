import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';
import * as http from 'http';

import * as fs from 'fs-extra';
import got from 'got';
import { Logger } from 'winston';

import * as logger from '../logger'
import { ITask } from '../types';
import { sleep } from '../helper';
// import { agent } from '../constants';

export interface DownTaskChunkConfig {
    name: string;
    id: string,
    seq: number,
    url: string,
    headers?: http.IncomingHttpHeaders,
    dest: string,
    size: number
}

export class DownTaskChunk implements ITask {
    private readonly destFile: string
    private readonly log: Logger;

    constructor(
        public readonly c: DownTaskChunkConfig
    ) {
        this.destFile = path.join(this.c.dest, this.c.seq.toString())
        this.log = logger.newLogger(`DownTaskChunk`)(this.c.name)
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
        const target = fs.createWriteStream(this.destFile)
        await pipeline(source, target)
        if (this.checkExist()) {
            if (this.checkValid()) {
                return
            } else {
                this.remove()
            }
        }
        await sleep(1000)
        throw new Error('valid failure')
    }

    private remove() {
        fs.removeSync(this.destFile)
    }

    private checkExist(): boolean {
        return fs.existsSync(this.destFile)
    }

    private checkValid(): boolean {
        return fs.statSync(this.destFile).size === this.c.size
    }

}
