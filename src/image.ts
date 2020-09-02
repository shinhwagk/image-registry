import * as fs from 'fs-extra';
import * as path from 'path'

import { storageDir, proxyRepo } from './constants'
import { sha256sum } from './helper';
import { DownManager } from './down/manager';
import { ReadStream } from 'fs-extra';
import { DownTask } from './down/task';


export function checkExist(repo: string, image: string, sha256: string): boolean {
    return fs.existsSync(blobsPath(repo, image, sha256))
}

export async function checkSha256(blobs: string, sum: string): Promise<boolean> {
    return await sha256sum(blobs) === sum
}

export function blobsPath(repo: string, image: string, sha256: string): string {
    return path.join('/', storageDir, repo, image, sha256, 'blobs')
}

export class ProxyImageLayer {
    public static create(owner: string, image: string, sha256: string, auth?: string): ProxyImageLayer {
        return new ProxyImageLayer(owner + '/' + image, sha256, auth)
    }

    private readonly dmgr = new DownManager();
    private readonly layerFile: string

    constructor(private readonly name: string, private readonly sha256: string, private readonly auth?: string) {
        this.layerFile = path.join(storageDir, proxyRepo, name, sha256, 'blobs')
        this.init()
    }

    private init() {
        fs.mkdirpSync(path.join(storageDir, proxyRepo))
    }
    private checkExist() {
        return fs.existsSync(this.layerFile)
    }

    private async checkSha256() {
        return (await sha256sum(this.layerFile)) === this.sha256
    }

    public blobsStream(): ReadStream {
        console.log('stream ' + this.layerFile)
        return fs.createReadStream(this.layerFile)
    }

    private clear() {
        fs.removeSync(this.layerFile)
    }

    private async down() {
        const task = new DownTask(this.url(), this.dest(), this.name, this.sha256, this.auth)
        this.dmgr.addTask(task)
        await this.dmgr.wait(task)
    }

    private url() {
        console.log(`https://${proxyRepo}/v2/${this.name}/blobs/sha256:${this.sha256}`)
        return `https://${proxyRepo}/v2/${this.name}/blobs/sha256:${this.sha256}`
    }

    private dest() {
        return path.join(storageDir, proxyRepo, this.name, this.sha256)
    }

    public async verify(): Promise<void> {
        if (this.checkExist() && await this.checkSha256()) {
            return
        }
        this.clear()
        await this.down()
    }
}