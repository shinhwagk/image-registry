const http = require("http")

const server = http.createServer((req, res) => {
    let rawData = '11111';
    req.on("data", (c) => { rawData += c })
    req.on("end", () => { console.info("url", req.url); console.info("method", req.method); console.info("headers", req.headers); console.info("body", rawData) })
});

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8000);
console.info("http server start, listen: 8000")