import * as assert from "assert";
import { existsSync, mkdirpSync, rmdirSync } from "fs-extra";
import { RegistryClient } from "../src/client";
import { DownManager } from "../src/down/manager";
import { sha256sumOnFile } from "../src/helper";
import { ThirdRegistry } from "../src/registry";
import { DistributionFS } from "../src/distribution";

// describe('got manfiest', () => {
//     const fs = new DistributionFS('quay.io/outline/shadowbox');
//     const rc = new RegistryClient('quay.io', 'outline/shadowbox', fs)
//     it("xxx", async () => {
//         await rc.gotManifest('daily')
//         assert.strictEqual(1, 1)
//     }).timeout(10000)
// })

// describe('got blob', () => {
//     const fs = new DistributionFS('quay.io/outline/shadowbox');
//     const rc = new RegistryClient('quay.io', 'outline/shadowbox', fs)
//     it("xxx", async () => {
//         await rc.gotBlob('sha256:01dd96e21c1a39e310ccec12dc27f88574a1ebf8fd5952fdb352324d5488a873')
//         assert.strictEqual(1, 1)
//     }).timeout(10000)
// })

describe('got manfiest', () => {
    const fs = new DistributionFS('docker.io', 'library/node');
    const rc = new RegistryClient(ThirdRegistry['docker.io'], 'library/node', fs)
    it("docker.io node", async () => {
        await rc.gotBlob('sha256:e5c5821cd8891e4cb78b57e971882385cf3d9541a6071c9ae64263c7ed8152b4')
        assert.strictEqual(1, 1)
    }).timeout(10000)
})

// const dest = "storage"
// async function test_client() {
//     console.log("====================test_client start==========================")
//     mkdirpSync(dest)
//     console.log("create RegistryClient")
//     const rc = new RegistryClient('quay.io', 'outline/shadowbox')
//     await rc.tryGetAuth()
//     await rc.gotBlob('6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f', dest, dest + '/cache')
//     let sha = await sha256sumOnFile(`storage/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f`)
//     assert.strictEqual(sha, '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f');

//     await rc.gotBlob('773329dd0d5d29d3187db37081e73a392a02023dace6d3651eba6fc602074568', dest, dest + '/cache')
//     sha = await sha256sumOnFile(`storage/sha256:773329dd0d5d29d3187db37081e73a392a02023dace6d3651eba6fc602074568`)
//     assert.strictEqual(sha, '773329dd0d5d29d3187db37081e73a392a02023dace6d3651eba6fc602074568');

//     rmdirSync(dest, { recursive: true })
//     console.log("====================test_client end==========================")
// }

// async function test_client2() {
//     console.log("====================test_client manifest start==========================")
//     console.log("create RegistryClient")
//     const rc = new RegistryClient('quay.io', 'outline/shadowbox')
//     await rc.gotManifest('server-2020-09-28')
//     existsSync('notes/test/quay.io/outline/shadowbox/manifest')
//     console.log("====================test_client manifest end==========================")
// }


// export default [test_client, test_client2]
