const http = require("http")
const fs = require("fs")
const https = require("https");

const server = http.createServer((req, res) => {
    if (req.url === '/v2/') {
        res.end('true')
        return
    }
    const pu = req.url.split('/')
    if (pu.length === 6 && pu[1] === 'v2' && pu[4] === 'manifests') {
        res.setHeader('content-type', 'application/vnd.docker.distribution.manifest.v1+json')
        res.setHeader('docker-content-digest', 'sha256:433c44794ffe3a4b7ba7d4444d8d1b82743b24c4ccf8024bab252f76e37fa1bf')
        const cont = fs.readFileSync('body.json', { encoding: 'utf-8' })
        res.end(cont)
        return
    }
    // /v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95
    if (pu.length === 6 && pu[1] === 'v2' && pu[4] === 'blobs') {
        return
    }
    let rawData = '';
    req.on("data", (c) => { rawData += c })
    req.on("end", () => { console.info("url", req.url); console.info("method", req.method); console.info("headers", req.headers); console.info("body", rawData) })
});

server.on('error', (err) => console.log(err))

// server.listen(8000);


https.get('https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', (res) => {
    console.log(res.statusCode)
    if (res.statusCode === 302) {
        const newurl = res.headers['location']
        https.get(newurl,{headers:{Range:'bytes=0-20026558'}}, (res2) => {
            console.log(res2.headers)
            const file = fs.createWriteStream("data1.txt");
            var stream = res2.pipe(file)
            stream.on("finish", () => { console.log("done"); });
            // stream.on("pipe",(sec)=>())
        })
    }
})

fs.createReadStream('data1.txt').pipe(fs.createWriteStream('newdata.txt')).on('finish', () => {
    fs.createReadStream('data2.txt').pipe(fs.createWriteStream('newdata.txt', { flags: 'a' }))
})