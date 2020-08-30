import * as fs from 'fs-extra';
import * as path from 'path'

import { storageDir, chunkSize, proxyRepo } from './constants'
import { sleep, sha256sum } from './helper';

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
    public static create(image: string, sha256: string) {
        return new ProxyImageLayer(image, sha256)
    }
    private readonly layerFile: string
    constructor(private readonly image: string, private readonly sha256: string) {
        this.layerFile = path.join('/', storageDir, proxyRepo, image, sha256, 'blobs')
    }

    private checkExist() {
        fs.existsSync(this.layerFile)
    }

    private async checkSha256() {
        return (await sha256sum(this.layerFile)) === this.sha256
    }

    public createReadStream() {
        return fs.createReadStream(this.layerFile)
    }
}