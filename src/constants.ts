export const storageDir: string = '/var/lib/registry';
export const chunkSize = 1 * 1024 * 1024;

export const proxyRepo = process.env['repo'] || 'docker.io';
export const logLevel = process.env['level'] || 'info';