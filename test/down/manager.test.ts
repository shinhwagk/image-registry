import * as assert from "assert";
import { mkdirp, mkdirpSync, rmdirSync, statSync } from "fs-extra";
import { DownTask } from "../../src/lib/down/down";
import { DownMangerService } from "../../src/lib/down/manager";
import { sha256sumOnFile } from "../../src/lib/helper";

const dest = "storage"

async function test_manager() {
    console.log("====================test_manager==========================")
    mkdirpSync(dest)
    const url = 'https://quay.io/v2/outline/shadowbox/blobs/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f'
    const config = {
        name: "outline/shadowbox",
        url,
        fname: 'sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f',
        dest,
        cacheDest: 'storage/cache',
        sha256: '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f'
    }
    for (let i = 0; i <= 10; i++) {
        DownMangerService.addTask(config)
    }
    await Promise.all([DownMangerService.wait(config), DownMangerService.wait(config)]);
    const sha = await sha256sumOnFile(`storage/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f`)
    assert.strictEqual(sha, '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f');
    rmdirSync(dest, { recursive: true })
    console.log("====================test_manager==========================")
}

export default [test_manager]
