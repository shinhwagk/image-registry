import { DownTask } from '../../src/down/task'
import { sha256sum } from '../../src/helper'

const url = 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'
const dest = 'test_temp'
const name = 'openshift/okd-content'
const sha256 = '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'


const tw = new DownTask(url, dest, name, sha256)

test('Check DownTask down', async () => {
    await tw.start()
    const blobsShasum = await sha256sum('test_temp/blobs')
    console.log(blobsShasum)
    expect(blobsShasum).toBe(sha256)
}, 60 * 1000 * 2);