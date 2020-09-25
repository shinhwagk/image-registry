import * as crypto from 'crypto'
import * as fs from 'fs-extra'

export function sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
}

export async function sha256sum(file: string): Promise<string> {
    return new Promise<string>((res) => {
        const fd = fs.createReadStream(file);
        const hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        fd.on('end', () => { hash.end(); res(hash.read()); }).pipe(hash);
    })
}
