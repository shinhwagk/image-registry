import { format as sfmt } from 'util'
import * as path from 'path'

import got from "got/dist/source";

import { DownTaskConfig } from './down/down';
import { DownMangerService } from './down/manager';
import { getblobDirectory, getDownBlobCacheDirectory } from './storage';
import { IDistribution } from './types';
import { RegistryConfig, ThirdRegistry } from './registry';
import { DownCache } from './constants';

function parserHeaderWWWAuthenticate(header: string): [string | undefined, string | undefined] {
    const res = /Bearer realm="(.*)",service="(.*)"/.exec(header)
    return res ? [res[1], res[2]] : [undefined, undefined]
}

export class RegistryClient {
    auth?: string
    authUrl?: string
    serviceUrl?: string
    isAuth = false
    manifestType = ""
    manifestDigest = ""
    constructor(
        private readonly registry: RegistryConfig,
        private readonly name: string,
        private readonly distribution: IDistribution) {
    }

    async ping(): Promise<void> {
        const res = await got(sfmt('https://%s/%s/', this.registry.registry, 'v2'), { throwHttpErrors: false })
        if (res.statusCode === 401 && res.headers["www-authenticate"]) {
            const [authUrl, serviceUrl] = parserHeaderWWWAuthenticate(res.headers["www-authenticate"])
            if (authUrl) {
                this.isAuth = true;
                this.authUrl = authUrl
                this.serviceUrl = serviceUrl
            }
        }
    }
    async tryGetAuth(): Promise<void> {
        await this.ping()
        if (this.isAuth) {
            const url = sfmt('%s?service=%s&scope=repository:%s:pull', this.authUrl, this.serviceUrl, this.name)
            const res = await got<{ token: string }>(url, { responseType: 'json' })
            this.auth = sfmt('Bearer %s', res.body.token)
        }
    }

    private async reqManifest(ref: string): Promise<string> {
        const headers: { [header: string]: string } = {
            accept: 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json',
            'accept-encoding': 'gzip'
        }
        if (this.isAuth && this.auth) {
            headers['authorization'] = this.auth
        }
        const url = sfmt('https://%s/v2/%s/manifests/%s', this.registry.registry, this.name, ref)
        const res = await got(url, { headers })
        if (res.headers['content-type']) {
            this.manifestType = res.headers['content-type']
            this.manifestDigest = res.headers['docker-content-digest'] as string
        }
        return res.body
    }

    private getblobUrl(digest: string): string {
        return sfmt('https://%s/v2/%s/blobs/%s', this.registry.registry, this.name, digest)
    }

    public async gotManifest(ref: string): Promise<void> {
        await this.tryGetAuth()
        const rawManifest: string = await this.reqManifest(ref);
        this.distribution.saveRawManifest(ref, this.manifestType, this.manifestDigest, rawManifest)
    }

    public async _gotBlob(digest: string, dest?: string, cacheDest?: string): Promise<void> {
        await this.tryGetAuth()
        const dtc: DownTaskConfig = {
            name: `${this.name}`,
            url: this.getblobUrl(digest),
            fname: digest,
            dest: dest || getblobDirectory(this.registry.daemon + '/' + this.name),
            cacheDest: cacheDest || DownCache,
            shasum: digest.substr(7),
            headers: { 'authorization': this.auth }
        }
        await DownMangerService.addAndWait(dtc)
    }

    public async gotBlob(digest: string, dest?: string, cacheDest?: string, retry = 5): Promise<void> {
        for (const _i of Array(retry)) {
            try {
                await this._gotBlob(digest, dest, cacheDest)
                return;
            } catch (e) {
                throw new Error(e.message)
            }
        }
    }
}
