import { existsSync, mkdirpSync, readFileSync, readJsonSync, writeFileSync, writeJsonSync } from 'fs-extra'
import * as path from 'path'
import { RegistryClient } from '../registry/client'
import { proxyRepo } from "../constants";
import { storageDir } from '../constants'
import { sha256sum } from '../helper'

export interface ManifestSchema {
    schemaVersion: 1 | 2
    mediaType: 'application/vnd.docker.distribution.manifest.v2+json' | 'application/vnd.docker.distribution.manifest.list.v2+json'
}


export function checkBlobsExist(name, sha) {
    return existsSync(path.join(storageDir, name, 'blobs', sha))
}

export function checkManifestExist(name, ref, version: 'v1' | 'v2' | 'v2list') {
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

function checkManifestV2ListExist(name, ref) {
    return existsSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.list.v2+json'))
}

function checkManifestV1Exist(name, ref) {
    return existsSync(path.join(storageDir, name, 'manifests', 'tags', ref, 'vnd.docker.distribution.manifest.v1+json'))
}

// export function checkManifestExist(name: string, reference: string): boolean {
//     if (reference.startsWith('sha256:')) {
//         return existsSync(path.join(storageDir, name, 'manifests', 'tags', reference))
//     } else {
//         return existsSync(path.join(storageDir, name, 'manifests', 'digests', reference))
//     }
// }

export function getManifest(name, reference): string | undefined {
    if (checkManifestExist(name, reference, "v2list")) {
        return readFileSync(path.join(storageDir, name, 'manifests', 'tags', reference, 'vnd.docker.distribution.manifest.list.v2+json'), { encoding: 'utf8' })
    }
    if (checkManifestExist(name, reference, "v2")) {
        return readFileSync(path.join(storageDir, name, 'manifests', 'tags', reference, 'vnd.docker.distribution.manifest.v2+json'), { encoding: 'utf8' })
    }
    if (checkManifestExist(name, reference, "v1")) {
        return readFileSync(path.join(storageDir, name, 'manifests', 'tags', reference, 'vnd.docker.distribution.manifest.v1+json'), { encoding: 'utf8' })
    }
    return undefined
}

export function readManifestString(name, reference): string {
    if (reference.startsWith('sha256:')) {
        return readFileSync(path.join(storageDir, name, 'manifests', 'digests', reference), { encoding: 'utf8' })
    }
}

export function checkLayerValidity(name, digest): boolean {
    const df = path.join(storageDir, name, 'blobs', digest)
    return existsSync(df) ? sha256sum(df) === digest : false
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

export function checkpointManifest(name, ref: string, manifest: string) {
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