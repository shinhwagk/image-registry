const http = require("http")
const fs = require("fs")
const got = require("got")

const server = http.createServer((req, res) => {
    console.log(req.method, req.url, req.headers)
    if (req.url === '/v2/') {
        // const r = got.get('http://172.25.8.123:5000/v2/', { headers: req.headers })
        // r.then(x => console.log(x.headers))
        const headers = req.headers
        headers.host = '172.25.8.123:5000'
        got.stream('http://172.25.8.123:5000' + req.url, { headers }).pipe(res)
        return
    }


    // if (req.url === '/v2/') {
    //     res.statusCode = 200;
    //     res.end()
    //     return
    // }
    if (req.method === 'HEAD' && req.url === '/v2/test/test2/blobs/sha256:df20fa9351a15782c64e6dddb2d4a6f50bf6d3688060a34c4014b0d9a752eb4c') {
        console.log(req.method, req.url, req.headers)
        const headers = req.headers
        headers.host = '172.25.8.123:5000'
        // const r = got.get('http://172.25.8.123:5000' + p, { headers: req.headers, throwHttpErrors: false })
        // r.then(x => console.log(x.headers, x.body, x.statusCode))
        // r.then(e => console.log(e.headers, e.body, e.statusCode))
        got.stream('http://172.25.8.123:5000' + req.url, { method: 'HEAD', headers, throwHttpErrors: false }).pipe(res)
        return

    }
    if (req.method === 'POST' && req.url === '/v2/test/test2/blobs/uploads/') {
        console.log("======================================================================")
        console.log(req.method, req.url, req.headers)
        const headers = req.headers
        headers.host = '172.25.8.123:5000'
        // const r = got.get('http://172.25.8.123:5000' + p, { headers: req.headers, throwHttpErrors: false })
        // r.then(x => console.log('111 POST', x.headers, x.body, x.statusCode))
        // r.then(e => console.log('111 POST', e.headers, e.body, e.statusCode))
        got.stream('http://172.25.8.123:5000' + req.url, { method: 'POST', headers, throwHttpErrors: false })
        console.log("======================================================================")
        // res.writeHead(202, { Location: '/v2/test/test2/blobs/uploads/aaaa-aaaa-aaaa-aaa', 'Docker-Upload-UUID': 'aaaa-aaaa-aaaa-aaa' });
        // res.end();
        // return;
        return
    }
    // if (req.method === 'PATCH' && req.url === '/v2/test/test2/blobs/uploads/aaaa-aaaa-aaaa-aaa') {
    //     console.log(req.method, req.url)
    //     let rawData = '';
    //     // res.writeHead(200, { Location: '/v2/test/test2/blobs/uploads/aaaa-aaaa-aaaa-aaa', 'Docker-Upload-UUID': 'aaaa-aaaa-aaaa-aaa' });
    //     req.pipe(fs.createWriteStream('notes/test/abc')).on('finish', () => {
    //         // ctx.req.on('data', (c) => console.log(c))
    //         // ctx.req.on('end', () => {
    //         res.writeHead(204, { Location: '/v2/test/test2/blobs/uploads/aaaa-aaaa-aaaa-aaa', 'Docker-Upload-UUID': 'aaaa-aaaa-aaaa-aaa', 'Content-Length': 0 })
    //         res.end()
    //         // res.statusCode = 204

    //     })

    //     // req.on("data", (c) => { rawData += c })
    //     // req.on("end", () => { console.info("url", req.url); console.info("method", req.method); console.info("headers", req.headers); console.info("body", rawData.length); res.statusCode = 204; res.end() })
    //     // return;
    // }

    // //  if(req.url ==='/v2/abc/abc/blobs/sha256:45480dd1290303504b0bced23101b98d0b2cf7960ac245f17f6848d3820061d1'){
    // //  res.writeHead(202,{
    // //            Location: '/v2/abc/abc/blobs/uploads/aaaa-aaaa-aaaa-aaaa'
    // //       });
    // // res.end();
    // //return
    // //}
    let rawData = '';
    req.on("data", (c) => { rawData += c })
    req.on("end", () => { console.info("url", req.url); console.info("method", req.method); console.info("headers", req.headers); console.info("body", rawData.length) })
});

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// server.listen(8000);
// console.info("http server start, listen: 8000")



// const http = require('http');

http.createServer(onRequest).listen(8000);

function onRequest(client_req, client_res) {
    console.log('serve: ' + client_req.url);

    console.log(client_req.method, client_req.headers)
    var options = {
        hostname: '172.25.8.123',
        port: 5000,
        path: client_req.url,
        method: client_req.method,
        headers: client_req.headers
    };

    var proxy = http.request(options, (res) => {
        console.log(res.statusCode, res.headers)
        client_res.writeHead(res.statusCode, res.headers)
        let c_cnt = 0
        // res.on('data', (d) => c_b1.push(d))
        // res.on('end', () => { console.log("res " + c_b1.length); })
        // setTimeout(() => {
        res.on('data', d => {
            client_res.write(d);
            c_cnt += 1
        })
        res.on('end', () => { client_res.end(); console.log("server " + c_cnt) })
        // res.pipe(client_res, {
        //     end: true
        // }).on('finish', () => { console.log("=========================================") })
        // }, 3000);
    })
    // const c_b = []
    // // client_req.on('data', (d) => c_b.push(d))
    // // client_req.on('end', () => { console.log("client_req " + c_b.length); })
    // setTimeout(() => {
    let c_cnt1 = 0
    client_req.on('data', d => { proxy.write(d); c_cnt1 += 1 })
    client_req.on('end', () => { proxy.end(); console.log("client " + c_cnt1) })

    // }, 3000);

}