
import * as path from 'path'

import { statSync, existsSync, mkdirpSync, writeFileSync, ReadStream, createReadStream, WriteStream, createWriteStream, readFileSync, readJsonSync } from 'fs-extra'

import { envDistribution } from './constants'
import { sha256sumOnFile, sha256sumOnString as sha256sumOnString } from './helper'
import { ManifestSchema, IDistribution, ManifestSchemaV2, AbsDistribution, ManifestStat } from './types'

export const CacheDirectory = path.join(envDistribution, 'cache')

export const blobsCacheDirectory = path.join(CacheDirectory, 'blobs')

export const ManifestsCacheDirectory = path.join(CacheDirectory, 'manifests')

export const DownblobsCacheDirectory = path.join(CacheDirectory, 'down')

export function getDownBlobCacheDirectory(name: string, digest: string): string {
    return path.join(DownblobsCacheDirectory, name, digest)
}

export function createblobCacheDirectory(): void {
    mkdirpSync(blobsCacheDirectory)
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

export function createblobDirectory(name: string): void {
    mkdirpSync(getblobDirectory(name))
}

export function getblobDirectory(name: string): string {
    return path.join(envDistribution, name, 'blob')
}

export function getblobFilePath(name: string, digest: string): string {
    return path.join(getblobDirectory(name), 'sha256:' + digest)
}

export function checkblobExist(name: string, digest: string): boolean {
    return existsSync(getblobFilePath(name, digest))
}

export function getManifestsDirectory(name: string, ref: string): string {
    if (ref.startsWith('sha256')) {
        return path.join(envDistribution, name, 'manifests', 'digests')
    } else {
        return path.join(envDistribution, name, 'manifests', 'tags', ref)
    }
}

export function getblobSize(name: string, sha: string): number {
    return statSync(getblobFilePath(name, sha)).size
}

export async function checkblobSha256sum(name: string, digest: string): Promise<boolean> {
    return (await sha256sumOnFile(getblobFilePath(name, digest))) === digest
}

export function getManifestFileForDigest(name: string, digest: string): string {
    return path.join(envDistribution, name, 'manifests', 'digests', digest)
}

export function getManifestFilePath(name: string, ref: string): string {
    if (ref.startsWith('sha256:')) {
        return getManifestFileForDigest(name, ref)
    } else {
        // return getManifestFileForTags(name, ref)
        return "1"
    }
}

export function persistentManifest(name: string, ref: string, content: string): void {
    const ms = JSON.parse(content) as ManifestSchema
    const sha256 = sha256sumOnString(content)
    createManifestsDirectories(name, ref)
    const mediaType: string = ms.schemaVersion === 1
        ? 'vnd.docker.distribution.manifest.v1+json'
        : (ms as ManifestSchemaV2).mediaType.substr(12)
    if (!ref.startsWith('sha256:')) {
        writeFileSync(path.join(getManifestsDirectory(name, ref), mediaType), `sha256:${sha256}`, { encoding: "utf8" })
    }
    const manifestFile = getManifestFilePath(name, `sha256:${sha256}`)
    writeFileSync(manifestFile, content, { encoding: 'utf8' })
}

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

export class DistributionFS extends AbsDistribution {
    constructor(name: string) { super(name) }

    public findManifest(ref: string): ManifestSchema | undefined {
        if (ref.startsWith('sha256:')) {
            return this.findManifestByDigest(ref.substr(7))
        }
        return this.findManifestByTag(ref)
    }

    public findManifestByDigest(digest: string): ManifestSchema | undefined {
        return readJsonSync(getManifestFileForDigest(this.name, digest), { encoding: 'utf8' })
    }

    public findManifestByTag(tag: string): ManifestSchema | undefined {
        const tagFile = getManifestFileForTags(this.name, tag)
        if (tagFile === undefined) return undefined
        return this.findManifestByDigest(readFileSync(tagFile, { encoding: 'utf8' }))
    }

    async validateManifest(ref: string): Promise<boolean> {
        if (ref.startsWith('sha256:')) {
            const mfile = getManifestFileForDigest(this.name, ref)
            return (await sha256sumOnFile(mfile)) === ref.substr(7)
        }
        const mftag = getManifestFileForTags(this.name, ref)
        if (!mftag) { return false }
        const digest = readFileSync(mftag, { encoding: 'utf8' })
        return this.validateManifest(digest)
    }

    statManifest(ms: ManifestSchema): ManifestStat {
        const mediaType = ms.schemaVersion === 1
            ? 'application/vnd.docker.distribution.manifest.v1+json'
            : (ms as ManifestSchemaV2).mediaType
        const digest = sha256sumOnString(JSON.stringify(ms))
        return { version: ms.schemaVersion, mediaType, digest, size: JSON.stringify(ms).length }
    }

    public saveManifest(ref: string, type: string, digest: string, manifest: ManifestSchema): void {
        persistentManifest(this.name, ref, JSON.stringify(manifest))
        // createManifestsDirectories(this.name, ref)
        // if (ref.startsWith('sha256:')) {

        // } else {
        //     if (manifest.SchemaVersion === 1) {
        //         saveManifestForV1(this.name, ref)
        //     }
        // }
        // return
    }

    public existManifest(ref: string): boolean {
        return false
    }

    public readerBlob(sha256: string): ReadStream {
        return createReadStream('./')
    }

    async validateBlob(sha256: string): Promise<boolean> {
        if (this.existBlob(sha256)) {
            return true
        } else {
            return false
        }
        return false
    }

    public saveBlob(buffer: ReadStream): void {
        return
    }

    public writerBlob(digest: string): WriteStream {
        return createWriteStream(getblobFilePath(this.name, digest))
    }

    public removeBlob(sha256: string): void {
        return
    }

    public statBlob(sha256: string): { size: number } {
        return {
            size: 1
        }
    }

    public existBlob(sha256: string): boolean {
        return false
    }

}
