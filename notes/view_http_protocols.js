const http = require('http');

http.createServer(onRequest).listen(8000);

function onRequest(client_req, client_res) {
    console.log('serve: ' + client_req.url);

    var options = {
        hostname: '192.168.67.69',
        port: 5000,
        path: client_req.url,
        method: client_req.method,
        headers: client_req.headers
    };

    var proxy = http.request(options, function (res) {
        console.log("server", res.statusCode, res.headers)
        client_res.writeHead(res.statusCode, res.headers)
        res.pipe(client_res, {
            end: true
        });
    });

    console.log("request", client_req.method, client_req.headers)
    client_req.pipe(proxy, {
        end: true
    });
}