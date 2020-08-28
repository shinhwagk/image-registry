"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const got_1 = __importDefault(require("got"));
const down_1 = require("./down");
const server = http.createServer((req, res) => {
    if (req.url === undefined) {
        res.end();
        return;
    }
    if (req.url === '/v2/') {
        res.end('true');
        return;
    }
    const pu = req.url.split('/');
    if (pu.length === 6 && pu[1] === 'v2' && pu[4] === 'manifests') {
        req.pipe(got_1.default.stream(`https://quay.io/${req.url}`)).pipe(res);
        return;
    }
    // /v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95
    if (pu.length === 6 && pu[1] === 'v2' && pu[4] === 'blobs') {
        const mgr = new down_1.DownManager("quay.io", pu[2] + '/' + pu[3], pu[5].substr(7));
        console.log("quay.io", pu[2] + '/' + pu[3], pu[5].substr(7));
        console.log(mgr.layerBlobs);
        mgr.start(1024 * 1024).then(() => fs.createReadStream(mgr.layerBlobs).pipe(res));
        return;
    }
});
server.on('error', (err) => console.log(err));
server.listen(9999, () => console.log('start.'));
