import * as http from 'http';
import * as fs from 'fs';

import got from 'got';

import { DownManager } from './down';

const server = http.createServer((req, res) => {
    if (req.url === undefined) {
        res.end()
        return;
    }
    if (req.url === '/v2/') {
        res.end('true')
        return
    }
    const pu = req.url.split('/')
    if (pu.length === 6 && pu[1] === 'v2' && pu[4] === 'manifests') {
        req.pipe(got.stream(`https://quay.io/${req.url}`)).pipe(res)
        return

    }
    // /v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95
    if (pu.length === 6 && pu[1] === 'v2' && pu[4] === 'blobs') {
        const mgr = new DownManager("quay.io", pu[2] + '/' + pu[3], pu[5].substr(7))
        console.log("quay.io", pu[2] + '/' + pu[3], pu[5].substr(7))
        console.log(mgr.layerBlobs)
        mgr.start(1024 * 1024).then(() => fs.createReadStream(mgr.layerBlobs).pipe(res))
        return
    }
});

server.on('error', (err) => console.log(err))

server.listen(9999, () => console.log('start.')); 