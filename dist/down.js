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
exports.DownManager = void 0;
const stream = __importStar(require("stream"));
const util_1 = require("util");
const fs = __importStar(require("fs-extra"));
const got_1 = __importDefault(require("got"));
const helper_1 = require("./helper");
// const split = 1 * 1024;
class DownManager {
    constructor(repo, image, sha256) {
        this.repo = repo;
        this.image = image;
        this.sha256 = sha256;
        this.chunks = {};
        this._down_url = this.genDownUrl();
        this.layerDir = `test/${repo}/${image}/${sha256}`;
        this.layerCacheDir = `${this.layerDir}/cache`;
        this.layerBlobs = `${this.layerDir}/blobs`;
        this.initDownDirectory();
    }
    genDownUrl() {
        return `https://${this.repo}/v2/${this.image}/blobs/sha256:${this.sha256}`;
    }
    async requestBlobSize() {
        const res = (await got_1.default.head(this._down_url));
        return Number(res.headers['content-length']);
    }
    computeChunks(blobsBytes, split) {
        const chunksNumber = (blobsBytes / split >> 0) + 1;
        for (let i = 0; i < chunksNumber; i++) {
            const r_start = i * split;
            if (chunksNumber - 1 === i) {
                this.chunks[i] = [r_start, blobsBytes];
                continue;
            }
            const r_end = r_start + split - 1;
            this.chunks[i] = [r_start, r_end];
        }
    }
    initDownDirectory() {
        fs.mkdirpSync(this.layerCacheDir);
    }
    checkShardDone(id) {
        return fs.existsSync(`${this.layerCacheDir}/${id}.done`);
    }
    async scheduleWorker() {
        const x = Object.entries(this.chunks);
        let pell = 10;
        for (const [i, [s, e]] of x) {
            if (this.checkShardDone(i)) {
                continue;
            }
            console.log(`start ${i}`);
            pell -= 1;
            const dw = DownWorker.create(this, Number(i), e - s).down();
            dw.then(_ => { pell += 1; console.log(`start ${i} done.`); });
            dw.catch(_ => { pell += 1; console.log(`start ${i} faile.`); });
            while (pell === 0) {
                await helper_1.sleep(1000);
                console.log(`sleep `);
            }
        }
    }
    async combineChunks() {
        if (fs.existsSync(this.layerBlobs)) {
            console.log('blobs exist');
            return;
        }
        console.log('combine chunks for aaaa');
        fs.removeSync(this.layerBlobs);
        for (const i of Object.keys(this.chunks)) {
            await appendFile(`${this.layerCacheDir}/${i}`, this.layerBlobs);
        }
        console.log('combine chunks for aaaa success');
    }
    cleanCacheIfNeed() {
        if (fs.existsSync(this.layerCacheDir)) {
            for (const i of Object.keys(this.chunks)) {
                fs.rmdirSync(`${this.layerCacheDir}`, { recursive: true });
            }
        }
    }
    async start(split) {
        if (!fs.existsSync(this.layerBlobs)) {
            const blobsBytes = await this.requestBlobSize();
            this.computeChunks(blobsBytes, split);
            await this.scheduleWorker();
            await this.combineChunks();
        }
        const sha256 = await helper_1.sha256sum(`${this.layerDir}/blobs`);
        console.log(sha256, this.sha256);
        if (sha256 === this.sha256) {
            this.cleanCacheIfNeed();
            console.log(111);
        }
        else {
            console.log("111111111");
        }
    }
}
exports.DownManager = DownManager;
class DownWorker {
    constructor(dm, id, inc) {
        this.dm = dm;
        this.id = id;
        this.inc = inc;
        this.r_start = id * 1024 * 1024;
        this.r_end = this.r_start + inc;
        this.chunkDoneFile = `${this.dm.layerCacheDir}/${id}.done`;
        this.chunkFile = `${this.dm.layerCacheDir}/${id}`;
    }
    static create(dmgr, id, inc) {
        return new DownWorker(dmgr, id, inc);
    }
    async down() {
        const pipeline = util_1.promisify(stream.pipeline);
        try {
            await pipeline(got_1.default.stream(this.dm._down_url, { headers: { Range: `bytes=${this.r_start}-${this.r_end}` } }), fs.createWriteStream(this.chunkFile));
            // if (this.checksize(id) === Number(r_end) - Number(r_start) + 1) {
            this.checkpoint(this.id);
            // } else {
            //     fs.removeSync(`${this.dm.cacheDir}/${id}`)
            // }
        }
        catch (e) {
            console.log(`id ${this.id} err ${e.message}`);
        }
    }
    checkpoint(id) {
        fs.writeFileSync(this.chunkDoneFile, '', { encoding: "utf-8" });
    }
    checksize(id) {
        const stat = fs.statSync(this.chunkFile);
        return stat.size;
    }
}
async function appendFile(input, output) {
    return new Promise((res, rej) => {
        fs.createReadStream(input).pipe(fs.createWriteStream(output, { flags: 'a' })).on('finish', () => res()).on('error', (err) => rej(err.message));
    });
}
const dm = new DownManager('quay.io', 'openshift/okd-content', '89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c');
// dm.requestHEAD()
dm.start(1024 * 1024);
// const pipeline = promisify(stream.pipeline);
