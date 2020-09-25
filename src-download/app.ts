import * as http from 'http';
import * as zlib from 'zlib';

import * as logger from './logger'
import { ProxyLayer } from './image/layer';

const log = logger.create('request')

http.createServer((req, res) => {
    if (req.url) {
        if (req.url === '/check') {
            res.statusCode = 200;
            res.end();
        } else if (req.url.startsWith('/proxy/layer')) {
            proxyLayerController(req, res)
        } else {
            log.debug(JSON.stringify(req.rawHeaders))
            proxyLayerController(req, res)
        }
    } else {
        res.statusCode = 500;
        res.end();
    }
}).listen(3001, () => log.info('Proxy Laryer Blobs Server Start.\nlisten port 3001.'))

const proxyLayerController: http.RequestListener = async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [owner, image, sha256] = req.url!.split('/').slice(3)
    const pil = ProxyLayer.create(owner, image, sha256, req.headers['authorization'])
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