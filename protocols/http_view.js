// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require("http")

http.createServer((req, res) => {
    let rawData = '';
    req.on("data", (c) => { rawData += c })
    req.on("end", () => {
        console.info("url", req.url); console.info("method", req.method); console.info("headers", req.headers);
        if (rawData.length >= 1) {
            console.info("body", rawData)
        }
        res.end()
    })
}).listen(8000)


//  /v2
// const server = http.createServer((req, res) => {

//     if (req.url === '/v2/') {
//         // got.stream('https://quay.io/v2/', { throwHttpErrors: false }).pipe(res)
//         return;
//     }
//     if (req.url.startsWith('/v2/openshift/okd/manifests/')) {
//         console.log(req.headers)
//         // got('https://quay.io' + req.url, {
//         //     headers: {
//         //         accept: 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json',
//         //         'accept-encoding': 'gzip',
//         //     }
//         // }).then(x => {
//         //     console.log(x.statusCode)
//         //     console.log(x.headers)
//         // })
//         return
//     }
//     let rawData = '';
//     req.on("data", (c) => { rawData += c })
//     req.on("end", () => {
//         console.info("url", req.url); console.info("method", req.method); console.info("headers", req.headers);
//         if (rawData.length >= 1) {
//             console.info("body", rawData)
//         }
//     })
// });

// server.on('clientError', (err, socket) => {
//     socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
// });

// server.listen(8000);
// console.info("http server start, listen: 8000")