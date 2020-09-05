// mutable
export const storageDir = process.env['storage'] || '/var/lib/registry';
export const proxyRepo = process.env['proxy_repo'] || 'quay.io';
export const logLevel = process.env['level'] || 'info';

// fix immutable
export const chunkSize: string = process.env['chunksize'] || '1048576'; // default 1m.

const proxyHost = process.env['host']
const proxyPort = process.env['port']

import * as tunnel from 'tunnel'

function makeProxy(host: string, port: number) {
    return {
        https: tunnel.httpsOverHttp({
            proxy: { host, port }
        })
    }
}

export const agent = proxyHost && proxyPort ? makeProxy(proxyHost, Number(proxyPort)) : {}