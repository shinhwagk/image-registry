import { statSync, removeSync, mkdirpSync } from 'fs-extra';

import { DownTask } from '../src/down/task'
import { DownTaskChunk } from '../src/down/chunk'
import { DownManager } from '../src/down/manager'
import { sha256sum } from '../src/helper'

const url = 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'
const dest = 'storage'
const name = 'openshift/okd-content'
const sha256 = '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'

afterAll(() => {
    removeSync(dest)
});

beforeAll(() => {
    mkdirpSync(dest)
})

describe('test down task chunk', () => {
    const twc = new DownTaskChunk("0", 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', undefined, 'storage', 0, 19)
    test('Check TaskWorker down', async () => {
        await twc.down()
        expect(statSync('storage/0').size).toBe(20)
    });
})

const tw = new DownTask(url, dest, name, sha256)

test('Check DownTask', async () => {
    await tw.start()
    const blobsShasum = await sha256sum('storage/blobs')
    console.log(blobsShasum)
    expect(blobsShasum).toBe(sha256)
}, 60 * 1000 * 2);

describe('test DownManager', () => {
    mkdirpSync(`storage/openshift/okd-content/${sha256}`)
    const task1 = new DownTask(url, `storage/openshift/okd-content/${sha256}`, name, sha256)
    // const task2 = new DownTask(url, `storage/openshift/okd-content/${sha256}`, name, sha256)
    const dmgr = new DownManager()
    test('Check some task down', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const i of Array(20)) {
            dmgr.addTask(task1)
        }
        await dmgr.wait(task1)
        const blobsShasum = await sha256sum(`storage/openshift/okd-content/${sha256}/blobs`)
        expect(blobsShasum).toBe(sha256)
    }, 60 * 1000 * 2);

    test('Check DownTask down', async () => {
        dmgr.addTask(task1)
        await dmgr.wait(task1)
        const blobsShasum = await sha256sum(`storage/openshift/okd-content/${sha256}/blobs`)
        expect(blobsShasum).toBe(sha256)
    }, 60 * 1000 * 2);
})

