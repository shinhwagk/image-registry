// const { fstat, fstatSync } = require('fs');

// const worker = require('../../dist/down/worker');
import { DownWorker } from '../../src/down/worker'
// const { mkdirsSync } = require('fs-extra');


// mkdirsSync('test_temp')

// test('adds 1 + 2 to equal 3', () => {
const worker1 = new DownWorker("0", 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', undefined, './test_temp', 0, 19)
worker1.down()
//     return worker1.down().then(() => {
//         console.log(fstatSync("./test_temp/0"))
//         expect(fstatSync('./test_temp/0').size).toEqual(20)
//     });
// });

// const worker1 = new worker.DownWorker("0", 'https://quay.io/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95', undefined, './test_temp', 0, 9999)
// worker1.down()