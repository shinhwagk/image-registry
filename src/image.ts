import * as fs from 'fs-extra';
import * as path from 'path'

import { storageDir, chunkSize, proxyRepo } from './constants'
import { sleep, sha256sum } from './helper';
import { DownManager } from './down';


export function checkExist(repo: string, image: string, sha256: string) {
    return fs.existsSync(blobsPath(repo, image, sha256))
}

export async function checkSha256(blobs: string, sum: string) {
    return await sha256sum(blobs) === sum
}

export function blobsPath(repo: string, image: string, sha256: string): string {
    return path.join('/', storageDir, repo, image, sha256, 'blobs')
}

export class ProxyImageLayer {
    public static create(owner: string, image: string, sha256: string) {
        return new ProxyImageLayer(owner + '/' + image, sha256)
    }
    private readonly layerFile: string
    constructor(private readonly name: string, private readonly sha256: string) {
        this.layerFile = path.join('/', storageDir, proxyRepo, name, sha256, 'blobs')
    }

    private checkExist() {
        return fs.existsSync(this.layerFile)
    }

    private async checkSha256() {
        return (await sha256sum(this.layerFile)) === this.sha256
    }

    public createReadStream() {
        return fs.createReadStream(this.layerFile)
    }

    private clear() {
        fs.removeSync(this.layerFile)
    }

    private async down() {
        const dmgr = DownManager.create(this.url(), this.dest(), 'blobs', this.sha256)
        dmgr.start()
    }

    private url() {
        return `https://${proxyRepo}/v2/${this.name}/blobs/sha256:${this.sha256}`
    }

    private dest() {
        return path.join(storageDir, proxyRepo, this.name, this.sha256)
    }

    public async verify() {
        if (this.checkExist() && await this.checkSha256()) {
            return true
        }
        this.clear()
        this.down()
        return false
    }
}