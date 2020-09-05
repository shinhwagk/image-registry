// mutable
export const storageDir = process.env['storage'] || '/var/lib/registry';
export const proxyRepo = process.env['proxy_repo'] || 'quay.io';
export const logLevel = process.env['level'] || 'info';

// fix immutable
export const chunkSize: string = process.env['chunksize'] || '1048576'; // default 1m.