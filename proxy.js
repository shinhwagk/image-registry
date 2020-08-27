const https = require('http');

const httpsGetRequest =   function (url) {
    console.log(url)
    var options = {
        method: 'HEAD',
        port: 443,
        host: 'quay.io',
        path: '/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'
    };
    // return new Promise((pres, prej) => {
   var x= https.request(options, (res) => {
        console.log(res.statusCode, 1)
        // if (res.statusCode === 302) {
        //     console.log(res.headers['location'])
        //     httpsGetRequest(res.headers['location']).then(x => console.log(x))
        //     return
        // }
        // const bs = []
        // res.on('data', (c) => bs.push(c))
        // res.on('end', () => pres(bs.toString()))
    }).end()
    console.log(x.method,x.path)
    // .on('error', (err) => prej(err.message))
    // })
}

const RequestManifests = async function (repo, image, tag) {
    const url = `https://${repo}/v2/${image}/manifests/${tag}`
    const res = await httpsGetRequest(url)
}

const ReqBlobsDetail = async function (repo, image, sha256) {
    // https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95
    const url = `https://${repo}/v2/${image}/blobs/sha256:${sha256}`
    return await httpsGetRequest(url)
}

// fn file number, from 0.
const SectionDown = async function (url, fn, range) {
    https.get(url, { headers: { Range: `bytes=${range}` } }, (res) => {
        res.pipe(fs.createWriteStream(fn)).on("finish", () => { console.log("done"); });
    })
}


ReqBlobsDetail('quay.io', 'openshift/okd-content', '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95')
