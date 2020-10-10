const http = require('http');
const https = require('https');

http.createServer(onRequest).listen(8003);

function onRequest(client_req, client_res) {
    const print = ['serve: ' + client_req.url]
    // console.log('serve: ' + client_req.url);

    var options = {
        hostname: 'docker.io',
        host: "docker.io",
        port: 443,
        path: client_req.url,
        method: client_req.method,
        headers: client_req.headers
    };

    var proxy = https.request(options, function (res) {
        print.push('responce: ' + res.statusCode + " " + JSON.stringify(res.headers))
        client_res.writeHead(res.statusCode, res.headers)
        res.pipe(client_res, {
            end: true
        }).on('finish', () => {
            console.log("============================")
            for (const p of print) {
                console.log(p)
            }
            console.log("============================")
        })
    });

    // console.log("request", client_req.method, client_req.headers)
    print.push('request: ' + client_req.method + " " + JSON.stringify(client_req.headers))
    client_req.pipe(proxy, {
        end: true
    });
}