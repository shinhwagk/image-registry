import { format as sfmt } from 'util'

import got from "got/dist/source";
import { DownTask } from './down/down';
import { DownMangerService } from './down/manager';
import { join } from 'path';

type ManifestType = 'application/vnd.docker.distribution.manifest.list.v2+json' | 'application/vnd.docker.distribution.manifest.v2+json'

function parserHeaderWWWAuthenticate(header): [string | undefined, string | undefined] {
    const res = /Bearer realm="(.*)",service="(.*)"/.exec(header)
    return res ? [res[1], res[2]] : [undefined, undefined]
}

export class RegistryClient {
    token?: string
    authUrl?: string = undefined
    serviceUrl?: string
    isAuth = false
    manifest: string
    manifestType?: ManifestType
    proxyRepoUrl: string
    constructor(repo: string, private readonly name: string, private readonly distribution: string, private readonly ref: string = 'latest') {
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
    async login(): Promise<void> {
        if (this.isAuth) {
            const url = sfmt('%s?service=%s&scope=repository:%s:pull', this.authUrl, this.serviceUrl, this.name)
            const res = await got(url, { responseType: 'json' })
            console.log(res.body)
            this.token = sfmt('Bearer %s', res.body['token'])
        }
    }

    async reqManifests(): Promise<void> {
        const headers = {
            accept: 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json',
            'accept-encoding': 'gzip'
        }
        if (this.isAuth && this.token) {
            headers['authorization'] = sfmt('Bearer %s', this.token)
        }
        // console.log(this.registryUrl, this.serviceUrl, headers)
        const url = sfmt('%s/v2/%s/manifests/%s', this.proxyRepoUrl, this.name, this.ref)
        console.log(url)
        const res = await got(url, { headers })
        console.log(res.headers)
        if (res.headers['content-type']) {
            this.manifestType = res.headers['content-type'] as ManifestType
        }
        this.manifest = res.body
    }

    async downBlobs(digest: string): Promise<void> {
        const task = new DownTask(`${join(this.proxyRepoUrl, 'v2', this.name, 'blobs', 'sha256:' + digest)}`, `${this.distribution}/sha256:${digest}`, digest, this.token)
        // this.log.debug('add task to DownManager.')
        await DownMangerService.wait(task)

        // await .wait(task)
    }
    // async saveManifests() {
    //     const headers = {
    //         accept: 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json',
    //         'accept-encoding': 'gzip'
    //     }
    //     if (this.isAuth && this.token) {
    //         headers['authorization'] = sfmt('Bearer %s', this.token)
    //     }
    //     // console.log(this.registryUrl, this.serviceUrl, headers)
    //     const url = sfmt('%s/v2/%s/manifests/%s', this.registryUrl, this.name, this.ref)
    //     const tempManifest = path.join(ManifestsCacheDirectory, mfuid)
    //     await got.stream(url, { headers }).pipe(fs.createWriteStream(tempManifest))
    // }

    // async reqBlobs(sha) {

    // }
}



// interface ManifestType {

// }

// test
// const rc = new RegistryClient('https://quay.io', 'openshift', 'okd', '4.5.0-0.okd-2020-09-04-180756');
// (async () => {
//     await rc.ping()
//     await rc.login()
//     await rc.reqManifests()
//     console.log(rc.manifestType)
//     console.log(rc.manifest)
// })()

// const rc2 = new RegistryClient('https://registry-1.docker.io', 'library/node', '14');
// (async () => {
//     await rc2.ping()
//     await rc2.login()
//     await rc2.reqManifests()
//     console.log(rc2.manifestType)
//     console.log(rc2.manifest)
// })()