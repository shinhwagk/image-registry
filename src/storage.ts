
import * as path from 'path'

import { statSync, existsSync, mkdirpSync, writeFileSync, ReadStream, createReadStream, WriteStream, createWriteStream, readFileSync, readJsonSync } from 'fs-extra'

import { envDistribution } from './constants'
import { sha256sumOnFile, sha256sumOnString as sha256sumOnString } from './helper'
import { ManifestSchema, ManifestSchemaV2, AbsDistribution, ManifestStat } from './types'

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
    return path.join(envDistribution, name, 'blobs')
}

export function getblobFilePath(name: string, digest: string): string {
    return path.join(getblobDirectory(name), digest)
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

function getManifestFilePath(name: string, ref: string): string {
    if (ref.startsWith('sha256:')) {
        return getManifestFileForDigest(name, ref)
    } else {
        // return getManifestFileForTags(name, ref)
        return "1"
    }
}

function persistentManifest(name: string, ref: string, rawManifest: string, mediaType: string, digest: string): void {
    createManifestsDirectories(name, ref)
    if (!ref.startsWith('sha256:')) {
        writeFileSync(path.join(getManifestsDirectory(name, ref), mediaType.substr(12)), digest, { encoding: "utf8" })
    }
    const manifestFile = getManifestFilePath(name, digest)
    writeFileSync(manifestFile, rawManifest, { encoding: 'utf8' })
}

function getManifestFileForTags(name: string, tag: string): string | undefined {
    const tagDirectory = getManifestsDirectory(name, tag)
    const mediaTypes = ['vnd.docker.distribution.manifest.list.v2+json'
        , 'vnd.docker.distribution.manifest.v2+json'
        , 'vnd.docker.distribution.manifest.v1+json']
    for (const mt of mediaTypes) {
        const tagFile = path.join(tagDirectory, mt)
        if (existsSync(tagFile)) {
            return tagFile
        }
    }
    return undefined
}

export class DistributionFS extends AbsDistribution {
    constructor(daemon: string, name: string) { super(daemon, name) }

    public findManifest(ref: string): ManifestSchema | undefined {
        if (this.checkRefType(ref) === 'digest') {
            return this.findManifestByDigest(ref)
        }
        return this.findManifestByTag(ref)
    }

    public findManifestByDigest(digest: string): ManifestSchema | undefined {
        if (existsSync(getManifestFileForDigest(this.daemon + '/' + this.name, digest))) {
            return readJsonSync(getManifestFileForDigest(this.daemon + '/' + this.name, digest), { encoding: 'utf8' })
        }
        return undefined
    }

    public findManifestByTag(tag: string): ManifestSchema | undefined {
        const tagFile = getManifestFileForTags(this.daemon + '/' + this.name, tag)
        if (tagFile === undefined) return undefined
        return this.findManifestByDigest(readFileSync(tagFile, { encoding: 'utf8' }))
    }

    async validateManifest(ref: string): Promise<boolean> {
        if (ref.startsWith('sha256:')) {
            const mfile = getManifestFileForDigest(this.daemon + '/' + this.name, ref)
            return (await sha256sumOnFile(mfile)) === ref.substr(7)
        }
        const mftag = getManifestFileForTags(this.daemon + '/' + this.name, ref)
        if (!mftag) { return false }
        const digest = readFileSync(mftag, { encoding: 'utf8' })
        return this.validateManifest(digest)
    }

    public statManifest(ref: string, ms: ManifestSchema): ManifestStat {
        const mediaType = ms.schemaVersion === 1
            ? 'application/vnd.docker.distribution.manifest.v1+json'
            : (ms as ManifestSchemaV2).mediaType
        let digest = ref
        if (this.checkRefType(ref) === 'tag') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const tagpath = getManifestFileForTags(this.daemon + '/' + this.name, ref)!
            digest = readFileSync(tagpath, { encoding: 'utf8' })
        }
        const size = this.readerRawManfiest(digest).length
        // digest = ref.substr(7)
        return { version: ms.schemaVersion, mediaType, digest, size }
    }

    public saveManifest(ref: string, type: string, digest: string, manifest: ManifestSchema): void {
        // persistentManifest(this.daemon+'/'+this.name, ref, JSON.stringify(manifest))
        // createManifestsDirectories(this.daemon+'/'+this.name, ref)
        // if (ref.startsWith('sha256:')) {

        // } else {
        //     if (manifest.SchemaVersion === 1) {
        //         saveManifestForV1(this.daemon+'/'+this.name, ref)
        //     }
        // }
        // return
    }
    public readerRawManfiest(digest: string): string {
        return readFileSync(getManifestFileForDigest(this.daemon + '/' + this.name, digest), { encoding: 'utf8' })
    }

    public saveRawManifest(ref: string, type: string, digest: string, raw: string): void {
        // const manifest = JSON.parse(raw) as ManifestSchema
        // const { digest, version, mediaType } = this.statManifest(manifest)
        persistentManifest(this.daemon + '/' + this.name, ref, raw, type, digest)

    }

    public existManifest(ref: string): boolean {
        return false
    }

    public readerBlob(digest: string): ReadStream {
        return createReadStream(getblobFilePath(this.daemon + '/' + this.name, digest))
    }

    async validateBlob(digest: string): Promise<boolean> {
        return this.existBlob(digest)
    }

    public saveBlob(buffer: ReadStream): void {
        return
    }

    public writerBlob(digest: string): WriteStream {
        return createWriteStream(getblobFilePath(this.daemon + '/' + this.name, digest))
    }

    public removeBlob(digest: string): void {
        return
    }

    public statBlob(digest: string): { size: number } {
        return {
            size: 1
        }
    }

    public existBlob(digest: string): boolean {
        return checkblobExist(this.daemon + '/' + this.name, digest)
    }

}
