"use strict";
exports.__esModule = true;
exports.logLevel = exports.proxyRepo = exports.chunkSize = exports.storageDir = void 0;
exports.storageDir = process.env['storage'] || '/var/lib/registry';
exports.chunkSize = 1 * 1024 * 1024;
exports.proxyRepo = process.env['proxy_repo'] || 'docker.io';
exports.logLevel = process.env['level'] || 'info';
