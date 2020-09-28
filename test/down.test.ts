import * as path from 'path'
import * as assert from 'assert';

import { statSync, removeSync, mkdirpSync } from 'fs-extra';

import { DownTask } from '../src/lib/down/down'
import { DownTaskChunk } from '../src/lib//down/chunk'
import { DownMangerService } from '../src/lib//down/manager'
import { sha256sum, sleep } from '../src/lib//helper'
import { getBlobsFilePath } from '../src/lib/storage';
import got from 'got/dist/source';
import { RegistryClient } from '../src/lib/client';

const testData: { name: string, digest: string }[] = [{
    name: "openshift/okd-content",
    digest: '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'
}, {
    name: "coreos/etcd",
    digest: '5f56944bb51c627532324ca0f715de6563c08209fdc5dafa43993fd23652a3e6'
}, {
    name: "openshift/okd-content",
    digest: '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'
}, {
    name: "coreos/etcd",
    digest: '5f56944bb51c627532324ca0f715de6563c08209fdc5dafa43993fd23652a3e6'
}];

// describe('#indexOf()', () => {
//     it('should return -1 when the value is not present', async () => {
//         const twc = new DownTaskChunk("1", "0", 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', undefined, "dest", 0, 19)
//         assert.strictEqual([1, 2, 3].indexOf(4), -1);
//     });
// });

// afterAll(async () => {
//     await sleep(5000)
//     removeSync(dest)
// });

// describe('test down task chunk', () => {
//     const twc = new DownTaskChunk("1", "0", 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', undefined, "dest", 0, 19)
//     test('Check TaskWorker down', async () => {
//         await twc.start()
//         // expect(statSync('storage/0').size).toBe(20)
//     });
// })

// describe('test RegistryClient', () => {
//     it('should return -1 when the value is not present', async () => {
//         const res = await got('https://quay.io/v2/outline/shadowbox/manifests/server-2020-09-28', {
//             headers: {
//                 Accept: 'application/vnd.docker.distribution.manifest.v2+json',
//                 Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijg4NDkzY2EwNDk1ZmNkOWExYTgzMDAwZjFiOWI5NTRlOTM1ZmYxNTA4MjJiZTkzYTEwZmI4NjBmMjI5ZDIxNDEifQ.eyJhY2Nlc3MiOlt7InR5cGUiOiJyZXBvc2l0b3J5IiwibmFtZSI6Im91dGxpbmUvc2hhZG93Ym94IiwiYWN0aW9ucyI6WyJwdWxsIl19XSwiY29udGV4dCI6eyJjb20uYXBvc3RpbGxlLnJvb3RzIjp7Im91dGxpbmUvc2hhZG93Ym94IjoicXVheSJ9LCJjb20uYXBvc3RpbGxlLnJvb3QiOiJxdWF5In0sImF1ZCI6InF1YXkuaW8iLCJleHAiOjE2MDEyOTI1OTgsImlzcyI6InF1YXkiLCJpYXQiOjE2MDEyODg5OTgsIm5iZiI6MTYwMTI4ODk5OCwic3ViIjoiKGFub255bW91cykifQ.PRaLbPPitZNYwoivk3fiHbyUklgfw5SHKjstj_Vjb2bjz6jPTuF4_h9saw2MNFc_xCAqKkZbXZw0rdM871FHvhHbAphmKcw4Ysk00mC-CrWciU98gRJkN3oETGxut7GDdqyjyaHSgYlEYokZXAqKIlOEuZUNKBjM8wg6kOhohetW6eFJKy7Ci1HF9eGghMHtU3NCAUHVCKx5UUMDXZWLV0yhdYo2VCIbiars18LNcncF6x2BcqFKSrfmn6Y6J-x8_TyS_MdGfBS3ugFrwmBalIeLc7xNBN1OPreUBTLTvuSBc9_PIBLb_jQh0j2UWhMH7iS5P2L64JDLQRHU-VOh2Q'
//             }
//         })
//         console.log(res.statusCode)
//     })
// })


removeSync('notes/test');

(async () => {
    const rc = new RegistryClient('quay.io', 'outline/shadowbox', 'notes/test')
    await rc.ping()
    await rc.login()
    await rc.downBlobs('6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f')
    const sha = await sha256sum(`notes/test/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f`)
    assert.strictEqual(sha, '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f');
})();

removeSync('notes/test');

// (async () => {
//     await sleep(5000)
//     const url = 'https://quay.io/v2/outline/shadowbox/blobs/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f'
//     const tw = new DownTask(url, 'notes/test/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f', '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f')
//     await tw.start()
//     const sha = await sha256sum(`notes/test/sha256:6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f`)
//     assert.strictEqual(sha, '6bfb22f59047fee5261cab5114352687b081331dc5653b8c38517afab1a1315f');
// })()

// test('Check DownTask', async () => {
//     (async () => {
//         const url = 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'
//         const tw = new DownTask(url, 'notes/test/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95')
//         await tw.start()
//         // const blobsShasum = await sha256sum(dest)
//         assert.strictEqual(1, 1)
//     })();


// (async () => {
//     await Promise.all(testData.map(async ({ name, digest }) => {
//         console.log(name, digest, path.dirname(getBlobsFilePath(name, digest)))
//         mkdirpSync(path.dirname(getBlobsFilePath(name, digest)))
//         const url = `https://quay.io/v2/${name}/blobs/sha256:${digest}`;
//         const dest = getBlobsFilePath(name, digest)// `storage/blobs/sha256:${digest}`
//         const task = new DownTask(url, dest, name, digest)
//         DownMangerService.addTask(task)
//         await DownMangerService.wait(task)
//         const blobsShasum = await sha256sum(dest)
//         assert.strictEqual(blobsShasum, digest)
//     }))
// })()

//     const blobsShasum = await sha256sum(dest)
//     console.log(blobsShasum)
//     expect(blobsShasum).toBe(sha256)
// }, 60 * 1000 * 2);

// describe('test DownManager', () => {
//     mkdirpSync(`${dest}/${name}/${sha256}`)
//     const task1 = new DownTask(url, `${dest}/${name}/${sha256}`, name, sha256)
//     // const task2 = new DownTask(url, `storage/${name}/${sha256}`, name, sha256)
//     test('Check some task down', async () => {
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         for (const i of Array(20)) {
//             DownMangerService.addTask(task1)
//         }
//         await DownMangerService.wait(task1)
//         const blobsShasum = await sha256sum(`${dest}/${name}/${sha256}/blobs`)
//         expect(blobsShasum).toBe(sha256)
//     }, 60 * 1000 * 2);

//     test('Check DownTask down', async () => {
//         DownMangerService.addTask(task1)
//         await DownMangerService.wait(task1)
//         const blobsShasum = await sha256sum(`${dest}/${name}/${sha256}/blobs`)
//         expect(blobsShasum).toBe(sha256)
//     }, 60 * 1000 * 2);
// })
