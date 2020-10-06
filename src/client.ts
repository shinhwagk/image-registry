import { format as sfmt } from 'util'
import * as path from 'path'

import got from "got/dist/source";

import { DownTaskConfig } from './down/down';
import { DownMangerService } from './down/manager';
import { DistributionFS, getblobDirectory, getDownBlobCacheDirectory, persistentManifest } from './storage';
import { IDistribution, ManifestMedia, ManifestSchema } from './types';

function parserHeaderWWWAuthenticate(header: string): [string | undefined, string | undefined] {
    const res = /Bearer realm="(.*)",service="(.*)"/.exec(header)
    return res ? [res[1], res[2]] : [undefined, undefined]
}

export class RegistryClient {
    auth?: string
    authUrl?: string = undefined
    serviceUrl?: string
    isAuth = false
    manifestType = ""
    manifestDigest = ""
    proxyRepoUrl: string
    constructor(
        private readonly repo: string,
        private readonly name: string,
        private readonly distribution: IDistribution) {
        this.proxyRepoUrl = `https://${repo}`
    }

    async ping(): Promise<void> {
        const res = await got(sfmt('%s/%s/', this.proxyRepoUrl, 'v2'), { throwHttpErrors: false })
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

    private async reqManifest(ref: string): Promise<ManifestSchema> {
        const headers: { [header: string]: string } = {
            accept: 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json',
            'accept-encoding': 'gzip'
        }
        if (this.isAuth && this.auth) {
            headers['authorization'] = this.auth
        }
        // console.log(this.registryUrl, this.serviceUrl, headers)
        const url = sfmt('%s/v2/%s/manifests/%s', this.proxyRepoUrl, this.name, ref)
        const res = await got<any>(url, { headers, responseType: 'json' })
        if (res.headers['content-type']) {
            this.manifestType = res.headers['content-type']
            this.manifestDigest = res.headers['Docker-Content-Digest'] as string
        }
        return res.body
    }

    private getblobUrl(digest: string): string {
        return `${path.join(this.proxyRepoUrl, 'v2', this.name, 'blob', 'sha256:' + digest)}`
    }

    public async gotManifest(ref: string): Promise<void> {
        await this.tryGetAuth()
        const manifest: ManifestSchema = await this.reqManifest(ref);
        this.distribution.saveManifest(ref, this.manifestType, this.manifestDigest, manifest)
    }

    public async gotBlob(digest: string, dest?: string, cacheDest?: string): Promise<void> {
        const dtc: DownTaskConfig = {
            name: `${this.name}`,
            url: this.getblobUrl(digest),
            fname: `sha256:${digest}`,
            dest: dest || getblobDirectory(this.repo + '/' + this.name),
            cacheDest: cacheDest || getDownBlobCacheDirectory(this.repo + '/' + this.name, digest),
            sha256: digest,
            headers: { 'authorization': this.auth }
        }
        await DownMangerService.addAndWait(dtc)
    }
}
