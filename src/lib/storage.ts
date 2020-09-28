
import * as path from 'path'

import { statSync, existsSync, mkdirpSync, writeFileSync } from 'fs-extra'

import { envStorageDirectory } from './constants'
import { sha256sum, sha256sumForString } from './helper'
import { ManifestSchema } from './types'

export const BlobsCacheDirectory = path.join(envStorageDirectory, 'cache', 'blobs')

export const ManifestsCacheDirectory = path.join(envStorageDirectory, 'cache', 'manifests')

export function createBlobsCacheDirectory(): void {
    mkdirpSync(BlobsCacheDirectory)
}

export function createManifestsCacheDirectory(): void {
    mkdirpSync(ManifestsCacheDirectory)
}

export function createManifestsDirectories(name: string, ref: string): void {
    if (!ref.startsWith('sha256:')) {
        mkdirpSync(getManifestsDirectory(name, ref))
    }
    mkdirpSync(getManifestsDirectory(name, 'sha256'))
}

export function createBlobsDirectory(name: string): void {
    mkdirpSync(getBlobsDirectory(name))
}

export function getBlobsDirectory(name: string): string {
    return path.join(envStorageDirectory, name, 'blobs')
}

export function getBlobsFilePath(name: string, digest: string): string {
    return path.join(getBlobsDirectory(name), digest)
}

export function checkBlobsExist(name: string, digest: string): boolean {
    return existsSync(getBlobsFilePath(name, digest))
}

export function getManifestsDirectory(name: string, ref: string): string {
    if (ref.startsWith('sha256')) {
        return path.join(envStorageDirectory, name, 'manifests', 'digests')
    } else {
        return path.join(envStorageDirectory, name, 'manifests', 'tags', ref)
    }
}

export function getBlobsSize(name: string, sha: string): number {
    return statSync(getBlobsFilePath(name, sha)).size
}

export async function checkBlobsSha256sum(name: string, sha: string): Promise<boolean> {
    return (await sha256sum(getBlobsFilePath(name, sha))) === sha.substr(7)
}

export function getManifestFileForDigest(name: string, ref: string): string {
    return path.join(getManifestsDirectory(name, ref), ref)
}

export function getManifestFilePath(name: string, ref: string): string {
    if (ref.startsWith('sha256:')) {
        return getManifestFileForDigest(name, ref)
    } else {
        return getManifestFileForTags(name, ref)
    }
}

export function persistentManifest(name: string, ref: string, content: string): void {
    const ms = JSON.parse(content) as ManifestSchema
    const sha256 = sha256sumForString(content)
    console.log(sha256)
    createManifestsDirectories(name, ref)
    const mediaType: string = ms.schemaVersion === 1 ? 'vnd.docker.distribution.manifest.v1+json' : ms.mediaType.substr(12)
    if (!ref.startsWith('sha256:')) {
        writeFileSync(path.join(getManifestsDirectory(name, ref), mediaType), `sha256:${sha256}`, { encoding: "utf8" })
    }
    const manifestFile = getManifestFilePath(name, `sha256:${sha256}`)
    writeFileSync(manifestFile, content, { encoding: 'utf8' })
}

// export function getManifest(name: string, ref: string): ManifestSchema {
//     const manifestFile = ref.startsWith('sha256:') ?
//         getManifestFilePath(name, ref) :
//         getManifestFilePath(name, readFileSync(getManifestFilePath(name, ref), { encoding: 'utf8' }))
//     return readJsonSync(manifestFile)
// }

function getManifestFileForTags(name: string, tag: string): string | undefined {
    const tagDirectory = getManifestsDirectory(name, tag)
    if (existsSync(path.join(tagDirectory, 'vnd.docker.distribution.manifest.list.v2+json'))) {
        return path.join(tagDirectory, 'vnd.docker.distribution.manifest.list.v2+json')
    }
    if (existsSync(path.join(tagDirectory, 'vnd.docker.distribution.manifest.v2+json'))) {
        return path.join(tagDirectory, 'vnd.docker.distribution.manifest.v2+json')
    }
    if (existsSync(path.join(tagDirectory, 'vnd.docker.distribution.manifest.v1+json'))) {
        return path.join(tagDirectory, 'vnd.docker.distribution.manifest.v1+json')
    }
    return undefined
}

createManifestsCacheDirectory()
createBlobsCacheDirectory()