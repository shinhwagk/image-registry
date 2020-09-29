import * as assert from "assert";
import { mkdirpSync, rmdirSync, statSync } from "fs-extra";
import { DownTaskChunk } from "../../src/lib/down/chunk";

const dest = "storage"

async function test_chunk() {
    console.log("====================test_chunk==========================")
    mkdirpSync(dest)
    const twc = new DownTaskChunk("1", "0", 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', undefined, dest, 0, 19)
    await twc.start()
    assert.strictEqual(statSync('storage/0').size, 20)
    rmdirSync(dest, { recursive: true })
    console.log("====================test_chunk==========================")
}

export default [test_chunk]
