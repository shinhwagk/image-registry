import * as http from 'http';
import * as zlib from 'zlib';

import { ProxyImageLayer } from './image'

http.createServer((req, res) => {
    if (req.url) {
        if (req.url === '/check') {
            res.statusCode = 200;
            res.end();
        } else {
            layerController(req, res)
        }
    } else {
        res.statusCode = 500;
        res.end();
    }

}).listen(3001, () => console.log('proxy registry blobs server start.\nlisten port 3001'))

const layerController: http.RequestListener = async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [owner, image, sha256] = req.url!.split('/').slice(1)
    const pil = ProxyImageLayer.create(owner, image, sha256, req.headers['authorization'])
    try {
        await pil.verify()
        if (req.headers['accept-encoding'] === 'gzip') {
            res.writeHead(200, { 'content-encoding': 'gzip' });
            pil.blobsStream()
                .pipe(zlib.createGzip())
                .pipe(res)
        } else {
            pil.blobsStream().pipe(res)
        }
    } catch (e) {
        res.statusCode = 500;
        res.end(e.message);
    }
}