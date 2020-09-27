// mutable
// common app
export const envStorageDir = process.env['app-storage'] || 'notes/test'// '/var/lib/registry';
export const envLogLevel = process.env['app-log-level'] || 'info';

// app-repo
export const envAppRepoPort = process.env['repo-port'] || 8001;

// app-down
export const envAppDownPort = process.env['down-port'] || 8002;
export const proxyRepos: string[] = ["quay.io", "docker.io"]
export const chunkSize: string = process.env['chunksize'] || '1048576'; // default 1m.
const proxyHost = process.env['host']
const proxyPort = process.env['port']

// app-all
export const envAppAllPort = process.env['all-port'] || 8003;




// import * as tunnel from 'tunnel'

// function makeProxy(host, port) {
//     return {
//         https: tunnel.httpsOverHttp({
//             proxy: { host, port }
//         })
//     }
// }

// export const agent = proxyHost && proxyPort ? makeProxy(proxyHost, Number(proxyPort)) : {}