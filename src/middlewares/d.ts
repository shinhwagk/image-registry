import { proxyRepo } from "../constants";
import { checkImageValidity, checkManifestExist, requestManifest, readManifest, checkpointManifest, } from "../image";
import { RegistryClient } from '../registry/client'
import * as crypto from 'crypto'
import { writeFileSync } from "fs-extra";

export const api_d = async (ctx: any) => {
    console.log('api_d')
    const name = ctx.params[0]
    const ref = ctx.params[1]

    if (checkManifestExist(name, ref)) {
        const mf = readManifest(name, ref)
        ctx.set(mf['mediaType'])
        ctx.set('Docker-Content-Digest', 'sha256:48f84f6a5f7cf5e2f8b187d32211bd95108f0e21ededd81cc28b1c9ef18039e4')
        ctx.body = JSON.stringify(mf)
    } else {
        const mf = await requestManifest(name, ref)
        // checkpointManifest(name, ref, mf)
        console.log(222, mf)
        ctx.set('Content-Type', mf['mediaType'])
        const hash = crypto.createHash('sha256').update(mf).digest('hex');
        console.log(222, hash)
        ctx.set('Docker-Content-Digest', hash)
        ctx.body = mf
    }
}