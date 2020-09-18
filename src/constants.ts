// mutable
export const storageDir = process.env['storage'] || '/var/lib/registry';
export const proxyRepo = process.env['proxy-repo'] || 'https://quay.io' //'https://registry-1.docker.io'
export const logLevel = process.env['log-level'] || 'info';

// fix immutable
export const chunkSize: string = process.env['chunksize'] || '1048576'; // default 1m.

const proxyHost = process.env['host']
const proxyPort = process.env['port']

import * as tunnel from 'tunnel'

function makeProxy(host, port) {
    return {
        https: tunnel.httpsOverHttp({
            proxy: { host, port }
        })
    }
}

export const agent = proxyHost && proxyPort ? makeProxy(proxyHost, Number(proxyPort)) : {}