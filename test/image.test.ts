import { ProxyImageLayer } from '../src/image'
import { sha256sum } from '../src/helper'
import { mkdirpSync, removeSync } from 'fs-extra'

const sha256 = '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'
const owner = 'openshift'
const image = 'okd-content'

beforeAll(() => {
    // process.env = Object.assign(process.env, { storage: dest });
    // process.env.storage = dest
    // mkdirpSync(dest)
})

afterAll(() => {
    removeSync(`/var/lib/registry/quay.io/openshift/okd-content/${sha256}/blobs`)
})

describe('test image', () => {
    process.env.proxy_repo = 'quay.io'
    const pil = ProxyImageLayer.create(owner, image, sha256)
    test('Check image', async () => {
        await pil.verify()
        const blobsShasum = await sha256sum(`/var/lib/registry/quay.io/openshift/okd-content/${sha256}/blobs`)
        expect(blobsShasum).toBe(sha256)
    }, 60 * 2 * 1000);
})