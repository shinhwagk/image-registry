// mutable
// common app
export const envDistribution = process.env['DISTRIBUTION'] || 'notes/test'; // '/var/lib/registry';
export const envLogLevel = process.env['LOG_LEVEL'] || 'info';
export const envMaxParallel = process.env['MAX_PARALLEL'] || '10';
export const envAllPort = process.env['APP_PORT'] || 8003;

// app-down
export const envDownProxyRepos: string = process.env['DOWN_PROXY_REPOS'] || "quay.io, docker.io";
export const envDownChunkSize: string = process.env['DOWN_CHUNK_SIZE'] || '1048576'; // default 1m.
export const envDownProxyPrefix: string = process.env['DOWN_PROXY_PREFIX'] || 'proxy'; // default 1m.
export const envDownTimeout: string = process.env['DOWN_TIMEOUT'] || '20000'
export const DownCache = '/tmp'
const envDownProxyHost = process.env['DOWN_PROXY_HOST'];
const envDownProxyPort = process.env['DOWN_PROXY_PORT'];

// import * as tunnel from 'tunnel'

// function makeProxy(host, port) {
//     return {
//         https: tunnel.httpsOverHttp({
//             proxy: { host, port }
//         })
//     }
// }

// export const agent = proxyHost && proxyPort ? makeProxy(proxyHost, Number(proxyPort)) : {}