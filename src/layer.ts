import * as fs from 'fs-extra';
import * as path from 'path'

import { storageDir, chunkSize } from './constants'
import { sleep, sha256sum } from './helper';

export function checkExist(repo: string, image: string, sha256: string) {
    return fs.existsSync(blobsPath(repo, image, sha256))
}

export async function checkSha256(blobs: string, sum: string) {
    return await sha256sum(blobs) === sum
}

export function blobsPath(repo: string, image: string, sha256: string) {
    return path.join('/', storageDir, repo, image, sha256, 'blobs')
}