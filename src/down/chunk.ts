import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
import { Logger } from 'winston';

import * as logger from '../logger'
import { ReqHeader, ITask } from './types';
import { agent, storageDir, proxyRepo } from '../constants';

export interface IChunk {
    id: string;
    seq: number;
    url: string;
    auth?: string;
    dest: string;
    r_start: number;
    r_end: number;
}

function getLayerPath(image: string, layer: string): string {
    return path.join(storageDir, image, layer)
}

function getChunkPath(image: string, layer: string): string {
    return path.join(getLayerPath(image, layer), 'cache')
}

function getLayerUrl(image: string, layer: string): string {
    return `https://${proxyRepo}/v2/${image}/blobs/sha256:${layer}`
}

async function downChunk(id: number, seq: number, image: string, layer: string, auth?: string): Promise<void> {
    const chunkFile = getChunkPath(image, layer)
    const chunkUrl = getLayerUrl(image, layer)
    const chunkSize = 11
    if (!checkIsDown(chunkFile, chunkSize)) {
        return
    }
    removeChunkFile(chunkFile)
    // this.setHeaders()
    const pipeline = promisify(stream.pipeline);
    const source = got.stream(chunkUrl, { headers: this.headers, timeout: 20 * 1000, agent: agent })
        .on('request', request => setTimeout(() => request.destroy(), 30 * 1000));
    const target = fs.createWriteStream(chunkFile)
    await pipeline(source, target)
    if (checkChunkExist(chunkFile)) {
        if (checkChunkSize(chunkFile, chunkSize)) {
            this.log.info('done')
            return
        } else {
            this.remove()
        }
    }
    throw new Error('valid failure')
}

async function requestLayerOfImageBlobsSize(image: string, layer: string, auth?: string): Promise<void> {
    const headers: ReqHeader = auth ? { 'authorization': auth } : {}
    const res = (await got.head(url, { headers }))
    this.blobsBytes = Number(res.headers['content-length'])
}

function checkIsDown(chunkFile: string, size: number): boolean {
    return checkChunkExist(chunkFile) && checkChunkSize(chunkFile, size)
}

function makeHeaders(r_start: number, r_end: number, auth?: string) {
    const headers: ReqHeader = { Range: `bytes=${r_start}-${r_end}` }
    if (auth) {
        headers['authorization'] = auth
    }
    return headers
}

function checkChunkExist(chunkFile: string): boolean {
    return fs.existsSync(chunkFile)
}

function checkChunkSize(chunkFile: string, size: number): boolean {
    return fs.statSync(chunkFile).size === size
}

function removeChunkFile(chunkFile: string) {
    fs.removeSync(chunkFile)
}

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
        return this.checkExist() && this.checkValid()
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
        this.remove()
        this.setHeaders()
        const pipeline = promisify(stream.pipeline);
        const source = got.stream(this.url, { headers: this.headers, timeout: 20 * 1000, agent: agent })
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

}
