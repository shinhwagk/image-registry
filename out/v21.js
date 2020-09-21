"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_2 = require("fs");
const fs_3 = require("fs");
const http = require("http");
const uuid = require("uuid");
const requestListener = (req, res) => {
    if (req?.method === 'PATCH' && req.url && /^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/.test(req.url)) {
        const params = /^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/.exec(req.url);
        const name = params[1];
        const uid = params[2];
        console.log('PATCH');
        const x = [];
        req.pipe(fs_3.createWriteStream('notes/test/blobs')).on('finish', () => {
            console.log('PATCH ' + x.length);
            res.writeHead(202, {
                'Location': `/v2/${name}/blobs/uploads/${uid}`, 'Docker-Upload-UUID': uid, 'range': `0-${x.length}`
            });
            res.end();
        });
        // req.on('data', (d) => { x.push(d) })
        // req.on('end', () => {
        // })
    }
    else if (req?.method === 'GET' && req?.url === '/v2/') {
        console.log('//22222');
        res.end();
    }
    else if (req?.method === 'HEAD' && req?.url && /^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/.test(req.url)) {
        console.log('checkblobs');
        if (fs_1.existsSync('notes/test/blobs')) {
            const s = fs_2.statSync('notes/test/blobs');
            res.writeHead(200, {
                'content-length': s.size,
                'Docker-Content-Digest': 'sha256:8a29a15cefaeccf6545f7ecf11298f9672d2f0cdaf9e357a95133ac3ad3e1f07'
            });
        }
        else {
            res.writeHead(404);
        }
        res.end();
    }
    else if (req?.method === 'POST' && req?.url && /^\/v2\/(.+?)\/blobs\/sha256:([0-9a-zA-Z]{64})$/.test(req.url)) {
        const uid = uuid.v4();
        console.log('postBlobs');
        const x = [];
        req.on('data', (d) => { x.push(d); });
        req.on('end', () => {
            console.log('postBlobs ' + x.length);
            res.writeHead(202, { 'Location': `/v2/${name}/blobs/uploads/${uid}`, 'Docker-Upload-UUID': uid });
            res.end();
        });
    }
    else if (req?.method === 'POST' && req?.url && /^\/v2\/(.+?)\/blobs\/uploads\/$/.test(req.url)) {
        const params = /^\/v2\/(.+?)\/blobs\/uploads\/$/.exec(req.url);
        const name = params[1];
        const uid = uuid.v4();
        res.writeHead(202, { 'Location': `/v2/${name}/blobs/uploads/${uid}`, 'Docker-Upload-UUID': uid });
        res.end();
    }
    else if (req?.method === 'PUT' && req?.url && /^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/.test(req.url)) {
        console.log('putBlobs..', req.method, req.url);
        const params = /^\/v2\/(.+?)\/blobs\/uploads\/(.*)$/.exec(req.url);
        const name = params[1];
        const uid = params[2];
        // const uid = uuid.v4()
        const x = [];
        req.on('data', (d) => { x.push(d); });
        req.on('end', () => {
            console.log('putBlobs ' + x.length);
            res.writeHead(202);
            res.end();
        });
    }
    else if (req?.method === 'PUT' && req?.url && /v2\/(.*?)\/manifests\/(.*)$/.test(req.url)) {
        console.log('put manifests', req.method, req.url, req.headers);
        const x = [];
        req.on('data', (d) => { x.push(d); });
        req.on('end', () => {
            console.log('put manifests ' + x.length);
            res.writeHead(202);
            res.end();
        });
    }
    else {
        console.log("=========================================");
        console.log(req.method, req.url);
        console.log("other222");
        console.log("=========================================");
    }
};
http.createServer(requestListener).listen(8000, () => console.log("start"));
