import { existsSync, mkdirpSync, readFileSync, readJsonSync, writeFileSync, writeJsonSync } from 'fs-extra'
import * as path from 'path'
import { RegistryClient } from '../registry/client'
import { proxyRepo } from "../constants";
import { storageDir } from '../constants'
import { sha256sum } from '../helper'

export function checkManifestExist(name: string, reference: string): boolean {
    if (reference.startsWith('sha256:')) {
        return existsSync(path.join(storageDir, name, 'manifests', 'tags', reference))
    } else {
        return existsSync(path.join(storageDir, name, 'manifests', 'digests', reference))
    }
}

export function readManifest(name, reference) {
    return readJsonSync(path.join(storageDir, name, 'manifests', reference))
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

export function checkImageValidity(name, reference): boolean {
    const m = readManifest(name, reference)
    for (const l of m.layers) {
        const d: string = l.digest
        const digest = d.substr(7)
        if (!checkLayerValidity(name, digest)) {
            return false
        }
    }
    return true
}

export function checkpointManifest(name, ref: string, manifest: any) {
    console.log(manifest)
    mkdirpSync(path.join(storageDir, name, 'manifests'))
    writeJsonSync(path.join(storageDir, name, 'manifests', ref), manifest, { encoding: 'utf8' })
}

export async function requestManifest(name: string, ref: string) {
    const rc = new RegistryClient(proxyRepo, name, ref)
    await rc.ping()
    await rc.login()
    await rc.reqManifests()
    return rc.manifest
}