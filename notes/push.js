const http = require("http")
const fs = require("fs")

const server = http.createServer((req, res) => {
    if (req.url === '/v2/') {
        res.statusCode = 200;
        res.end()
        return
    }
    if (req.url === '/v2/abc/abc/blobs/sha256:e17d5a50701cd6bff06b8e7f5fc65d70050aa9ce746fdb820f8b46774ce0a174') {
        res.statusCode = 404;
        res.end()
        return
    }
    if (req.url === '/v2/abc/abc/blobs/uploads/') {
        res.writeHead(202, { Location: '/v2/abc/abc/blobs/uploads/aaaa-aaaa-aaaa-aaa', 'Docker-Upload-UUID': 'aaaa-aaaa-aaaa-aaa' });
        res.end();
    }
    //  if(req.url ==='/v2/abc/abc/blobs/sha256:45480dd1290303504b0bced23101b98d0b2cf7960ac245f17f6848d3820061d1'){
    //  res.writeHead(202,{
    //            Location: '/v2/abc/abc/blobs/uploads/aaaa-aaaa-aaaa-aaaa'
    //       });
    // res.end();
    //return
    //}
    let rawData = '';
    req.on("data", (c) => { rawData += c })
    req.on("end", () => { console.info("url", req.url); console.info("method", req.method); console.info("headers", req.headers); console.info("body", rawData) })
});

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8000);
console.info("http server start, listen: 8000")