import * as crypto from 'crypto'
import * as fs from 'fs'

export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

// var fs = require('fs');
// var crypto = require('crypto');


export async function sha256sum(file: string): Promise<string> {
    return new Promise<string>((res, rej) => {
        const fd = fs.createReadStream(file);
        const hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        fd.on('end', () => { hash.end(); res(hash.read()); }).pipe(hash);
    })
}