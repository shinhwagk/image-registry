// mutable
export const storageDir = process.env['storage'] || '/var/lib/registry';
export const proxyRepo = process.env['proxy_repo'] || 'quay.io';
export const logLevel = process.env['level'] || 'info';

// fix immutable
export const chunkSize = 1 * 1024 * 1024; // default 1m.