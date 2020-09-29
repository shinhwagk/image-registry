// mutable
// common app
export const envDistribution = process.env['all-distribution'] || 'notes/test'; // '/var/lib/registry';
export const envLogLevel = process.env['all-log-level'] || 'info';

// app-repo
export const envRepoPort = process.env['repo-port'] || 8001;

// app-down
export const envDownPort = process.env['down-port'] || 8002;
export const envDownProxyRepos: string = process.env['down-proxy-repo'] || "quay.io, docker.io";
export const envDownChunkSize: string = process.env['down-chunk'] || '1048576'; // default 1m.
export const envDownProxyPrefix: string = process.env['down-proxy-prefix'] || 'proxy'; // default 1m.
const envDownProxyHost = process.env['down-proxy-host'];
const envDownProxyPort = process.env['down-proxy-port'];

// app-all
export const envAllPort = process.env['all-port'] || 8003;

// import * as tunnel from 'tunnel'

// function makeProxy(host, port) {
//     return {
//         https: tunnel.httpsOverHttp({
//             proxy: { host, port }
//         })
//     }
// }

// export const agent = proxyHost && proxyPort ? makeProxy(proxyHost, Number(proxyPort)) : {}