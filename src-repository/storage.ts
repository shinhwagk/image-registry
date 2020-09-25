
import * as path from 'path'

import { statSync, existsSync, mkdirpSync, readFileSync, readJsonSync, writeFileSync, writeJsonSync } from 'fs-extra'

import { storageDir } from './constants'
import { sha256sum } from './helper'

export interface ManifestSchema {
    schemaVersion: 1 | 2
    mediaType: 'application/vnd.docker.distribution.manifest.v2+json' | 'application/vnd.docker.distribution.manifest.list.v2+json' | 'vnd.docker.distribution.manifest.v1+json'
}

export const BlobsCacheDirectory = path.join(storageDir, 'cache', 'blobs')

export const ManifestsCacheDirectory = path.join(storageDir, 'cache', 'manifests')

export function createBlobsCacheDirectory(): void {
    mkdirpSync(BlobsCacheDirectory)
}

export function createManifestsCacheDirectory(): void {
    mkdirpSync(ManifestsCacheDirectory)
}

export function createManifestsDirectory(name: string, ref: string): void {
    mkdirpSync(getManifestsDirectory(name, ref))
}

export function createBlobsDirectory(name: string): void {
    mkdirpSync(getBlobsDirectory(name))
}

export function getBlobsDirectory(name: string): string {
    return path.join(storageDir, name, 'blobs')
}

export function genUUID(name: string): string {
    return ''
}

export function getBlobsPath(name: string, sha: string): string {
    return path.join(getBlobsDirectory(name), sha)
}

export function checkBlobsExist(name: string, sha: string): boolean {
    return existsSync(getBlobsPath(name, sha))
}

export function getManifestsDirectory(name: string, ref: string): string {
    if (ref.startsWith('sha256')) {
        return path.join(storageDir, name, 'manifests', 'digests')
    } else {
        return path.join(storageDir, name, 'manifests', 'tags', ref)
    }
}

export function getBlobsSize(name: string, sha: string): number {
    return statSync(getBlobsPath(name, sha)).size
}

export async function checkBlobsSha256sum(name: string, sha: string): Promise<boolean> {
    return (await sha256sum(getBlobsPath(name, sha))) === sha.substr(7)
}

export function checkManifestExist(name: string, ref: string, version: string) {
    if (version === 'v2') {
        return existsSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v2+json'))
    }
    if (version === 'v1') {
        return existsSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v1+json'))
    }
    if (version === 'v2list') {
        return existsSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.list.v2+json'))
    }
}

function checkManifestV2ListExist(name: string, ref: string) {
    return existsSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.list.v2+json'))
}

function checkManifestV1Exist(name: string, ref: string) {
    return existsSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v1+json'))
}

// export function checkManifestExist(name: string, reference: string): boolean {
//     if (reference.startsWith('sha256:')) {
//         return existsSync(path.join(storageDir, name, 'manifests', 'tags', reference))
//     } else {
//         return existsSync(path.join(storageDir, name, 'manifests', 'digests', reference))
//     }
// }

// function getManifestFileForTags(name: string, ref: string) {
//     return path.join(getManifestsDirectory(name, 'tags'), ref)
// }

function getManifestFileForDigest(name: string, ref: string) {
    return path.join(getManifestsDirectory(name, ref), ref)
}

export function getManifestFile(name: string, ref: string): string | undefined {
    if (ref.startsWith('sha256')) {
        if (existsSync(getManifestFileForDigest(name, ref))) {
            return getManifestFileForDigest(name, ref)
        }
    } else {
        return getManifestFileForTags(name, ref)
    }
    return undefined
}
function getManifestFileForTags(name: string, tag: string): string | undefined {
    const tagDirectory = getManifestsDirectory(name, tag)
    console.log("tagDirectory", tagDirectory)
    if (existsSync(path.join(tagDirectory, 'vnd.docker.distribution.manifest.list.v2+json'))) {
        return path.join(tagDirectory, 'vnd.docker.distribution.manifest.list.v2+json')
    }
    console.log(path.join(tagDirectory, 'vnd.docker.distribution.manifest.v2+json'))
    if (existsSync(path.join(tagDirectory, 'vnd.docker.distribution.manifest.v2+json'))) {
        return path.join(tagDirectory, 'vnd.docker.distribution.manifest.v2+json')
    }
    if (existsSync(path.join(tagDirectory, 'vnd.docker.distribution.manifest.v1+json'))) {
        return path.join(tagDirectory, 'vnd.docker.distribution.manifest.v1+json')
    }
    return undefined
}

export function checkpointManifest(name: string, ref: string, manifest: string) {
    console.log(manifest)
    mkdirpSync(path.join(storageDir, name, 'manifests', 'tags', ref))
    writeFileSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'v2.json'), manifest, { encoding: 'utf8' })
}

createManifestsCacheDirectory()
createBlobsCacheDirectory()