import { existsSync, mkdirpSync, readFileSync, readJsonSync, writeFileSync, writeJsonSync } from 'fs-extra'
import * as path from 'path'
import { RegistryClient } from '../registry/client'
import { proxyRepo } from "../constants";
import { storageDir } from '../constants'
import { sha256sum } from '../helper'
import { statSync } from 'fs';

export interface ManifestSchema {
    schemaVersion: 1 | 2
    mediaType: 'application/vnd.docker.distribution.manifest.v2+json' | 'application/vnd.docker.distribution.manifest.list.v2+json' | 'vnd.docker.distribution.manifest.v1+json'
}

export function createBlobsCacheDirectory(name: string): void {
    mkdirpSync(getBlobsCacheDirectory(name))
}

export function getBlobsCacheDirectory(name: string): string {
    return path.join(storageDir, proxyRepo, name, 'cache')
}

export function genUUID(name: string): string {
    return ''
}

export function getBlobsPath(name: string, sha: string): string {
    return path.join(storageDir, proxyRepo, name, 'blobs', sha)
}

export function checkBlobsExist(name: string, sha: string): boolean {
    return existsSync(path.join(storageDir, proxyRepo, name, 'blobs', sha))
}

export function getManifestsDirectory(name: string): string {
    return path.join(storageDir, proxyRepo, name, 'manifests')
}

export function getBlobsSize(name: string, sha: string): number {
    return statSync(getBlobsPath(name, sha)).size
}

export async function checkBlobsSha(name: string, sha: string): Promise<boolean> {
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

export function getManifestFile(name: string, ref: string): string | undefined {
    if (existsSync(path.join(storageDir, proxyRepo, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.list.v2+json'))) {
        return path.join(storageDir, proxyRepo, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.list.v2+json')
    }
    console.log(path.join(storageDir, proxyRepo, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v2+json'))
    if (existsSync(path.join(storageDir, proxyRepo, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v2+json'))) {
        return path.join(storageDir, proxyRepo, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v2+json')
    }
    if (existsSync(path.join(storageDir, proxyRepo, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v1+json'))) {
        return path.join(storageDir, proxyRepo, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v1+json')
    }
    return undefined
}

export function getManifest(name: string, reference: string): string | undefined {
    if (checkManifestExist(name, reference, "vnd.docker.distribution.manifest.list.v2+json")) {
        return readFileSync(path.join(storageDir, name, 'manifests', 'tags', reference, 'vnd.docker.distribution.manifest.list.v2+json'), { encoding: 'utf8' })
    }
    if (checkManifestExist(name, reference, "vnd.docker.distribution.manifest.v2+json")) {
        return readFileSync(path.join(storageDir, name, 'manifests', 'tags', reference, 'vnd.docker.distribution.manifest.v2+json'), { encoding: 'utf8' })
    }
    if (checkManifestExist(name, reference, "vnd.docker.distribution.manifest.v1+json")) {
        return readFileSync(path.join(storageDir, name, 'manifests', 'tags', reference, 'vnd.docker.distribution.manifest.v1+json'), { encoding: 'utf8' })
    }
    return undefined
}

export function readManifestString(name: string, reference: string): string {
    if (reference.startsWith('sha256:')) {
        return readFileSync(path.join(storageDir, name, 'manifests', 'digests', reference), { encoding: 'utf8' })
    }
}

export function checkLayerValidity(name: string, digest: string): boolean {
    const df = path.join(storageDir, name, 'blobs', digest)
    return false
    // return existsSync(df) ? sha256sum(df) === digest : false
}

// export function checkImageValidity(name, reference): boolean {
//     const m = getManifest(name, reference)
//     for (const l of m.layers) {
//         const d: string = l.digest
//         const digest = d.substr(7)
//         if (!checkLayerValidity(name, digest)) {
//             return false
//         }
//     }
//     return true
// }

export function checkpointManifest(name: string, ref: string, manifest: string) {
    console.log(manifest)
    mkdirpSync(path.join(storageDir, name, 'manifests', 'tags', ref))
    writeFileSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'v2.json'), manifest, { encoding: 'utf8' })
}

export async function requestManifest(name: string, ref: string): Promise<string> {
    const rc = new RegistryClient(proxyRepo, name, ref)
    await rc.ping()
    await rc.login()
    await rc.reqManifests()
    return rc.manifest
}

export async function requestBlobs(name: string, sha: string): Promise<void> {
    const rc = new RegistryClient(proxyRepo, name)
    await rc.ping()
    await rc.login()
    // await rc.reqBlobs(sha)
}