import { statSync, removeSync } from 'fs-extra';

import { DownTaskChunk } from '../../src/down/worker'

const tw = new DownTaskChunk("0", 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', undefined, 'test_temp', 0, 19)


afterEach(() => {
    removeSync('test_temp/0')
});

test('Check TaskWorker down', async () => {
    await tw.down()
    expect(statSync('test_temp/0').size).toBe(20)
});