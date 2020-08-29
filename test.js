var fs = require("fs");
var https = require("https");

var options = {
  host: "quay.io",
  method: "HEAD",
  path: '/v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95'
};

var options1 = {
  host: "quay.io",
  method: "GET",
  path: '/v2/openshift/okd-content/blobs/sha256:89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c'
};

var options2 = {
  host: "cdn02.quay.io",
  method: "GET",
  path: '/sha256/70/70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95?Expires=1598514237&Signature=dHZD-khFyJRgx2jm43iK-sfproFXG9n6nRVuoNSdYgUcU5PmXncLfuxJV1GY88QO1eChENKLbI4Tj0XKPXBrDilH82ctfs9bgOTTuewDyXCfkRsWzQHWVJ2Uo~6D3q3ZKThIa37BTPNEdNXXkEcGpasiMvdjWmJVjqbB~94KeLhIVFgNGhblX4m-iKvKCG17COfb-pIV8bOV19zWJHUG67006wdRUP7M1r97H9sNTf0v1AQOLPn~S~jDF5WnyWxLTRRGcB4HSQnDLxQy7ee-haJYURoDF8H~HUFliSCfK15hPa4dHtlyjiUaxbJKESc2UEt1-dUAL65W4HRFwUx45A__&Key-Pair-Id=APKAJ67PQLWGCSP66DGA',
  headers: {
    Range: 'bytes=0-1000'
  }
};

// var req = https.request(options, function (res) {
//     console.log(res.statusCode);
//     console.log(res.headers)
// }).end()

// HEAD
// {
//     server: 'nginx/1.12.1',
//     date: 'Thu, 27 Aug 2020 07:38:57 GMT',
//     'content-type': 'application/octet-stream',
//     'content-length': '24026559',
//     connection: 'close',
//     'docker-content-digest': 'sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95',
//     'accept-ranges': 'bytes',
//     'cache-control': 'max-age=31436000',
//     'x-frame-options': 'DENY',
//     'strict-transport-security': 'max-age=63072000; preload'
//   }

// 1M = 1048576
// 'content-range': 'bytes 0-1048576/24026559',
// 'content-range': 'bytes 19922944-20971519/24026559',
// let maxx = 926491594
// const ls = (maxx / 1024 / 1024 >> 0) + 1
// function downDoneMark(id) {
//     fs.writeFileSync(`${id}.1.blobs.done`)
// }
// for (let i = 0; i < ls; i++) {

//     let y1 = i * 1024 * 1024
//     let y2 = y1 + 1 * 1024 * 1024 - 1
//     if (i == ls-1) {
//         console.log("222")
//         y2 = maxx
//     }
//     console.log(y1, y2)
//     console.log(i, y1, y2)
//     if (fs.existsSync(`${i}.1.blobs.done`)) {
//         continue
//     }
//     // options1.headers = { Range: `bytes=${y1}-${y2}` }
//     // https.request(options1, (res) => {
//     // console.log(res.headers)
//     // if (res.statusCode === 302) {
//     console.log(`bytes=${y1}-${y2}`)
//     const yy = https.request('https://cdn02.quay.io/sha256/89/89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c?Expires=1598522994&Signature=FgfDSnV6V29IpCotv8HHGouTY7em-GQmMyVwW2BvJE01mW1svfR3pqC48axHeJXwR06umfKK~ln6RKV34JxFeqXWYlcF2H35d3sviNXXYKnJOTnQE6osZB9JhEx4f82VHlCJfIHg-FRnq6zNf-x9CIRGYqRUObTzrNvcrET-1V~chwZLpGbjDzIlnZiNMObcsBgRbEBz0C7U8GS93QvdF68heBId6SAgwBhlssj4qiF06mnk0PvWat73L1jxwRoQX2KdRwhtjoyWWbjAS0lThAw-SOzSzpR6xwtTT6eRYJOxul8HvCvS5PfaAs7h2UGWjeB6Ikvqm2zaKJpeUzpx6A__&Key-Pair-Id=APKAJ67PQLWGCSP66DGA', { method: 'GET', headers: { Range: `bytes=${y1}-${y2}` } }, (res2) => {
//         console.log(res2.statusCode, res2.headers)
//         if ([206, 200].includes(res2.statusCode) && res2.headers['content-type'] === 'binary/octet-stream') {
//             res2.pipe(fs.createWriteStream(`${i}.1.blobs`)).on('finish', () => { console.log(`${i}.blobs done.`); downDoneMark(i) })
//         }
//     })
//     yy.end()
//     // }
//     // }).end()
// }
// }


// class Down {
var n = 884
//     combine() {
//         for (let i = 0; i < n; i++) {
//             await appendBinbey(`${i}.1.blobs`, 'x.1.bobs')
//         }
//     }
// }

// async function appendBinbey(input, output) {
//     // fs.unlinkSync('x.1.blobs')
//     return new Promise((res, rej) => {
//         fs.createReadStream(input).pipe(fs.createWriteStream(output, { flags: 'a' })).on('finish', () => res()).on('error', (err) => rej(err.message))
//     })
// }

// (async () => {
//     for (let i = 0; i < n; i++) {
//         await appendBinbey(`${i}.1.blobs`, 'x.1.blobs')
//     }
// })()


var fs = require('fs');
var crypto = require('crypto');
// const { stream } = require("got");

const hash = crypto.createHash('sha256');
const stream = fs.createReadStream('README.md');
// stream.on('error', err => err);
// stream.on('data', chunk => hash.update(chunk));
// stream.on('end', () => console.log(hash.digest('hex')));

// fs.createReadStream('README.md').pipe(crypto.createHash('sha256').setEncoding('hex')).once()

function checksumFile(algorithm, path) {
  return new Promise((resolve, reject) =>
    fs.createReadStream(path)
      .on('error', reject)
      .pipe(crypto.createHash(algorithm)
        .setEncoding('hex'))
      .once('finish', function () {
        resolve(this.read())
      })
  )
}

checksumFile('sha256', 'README.md').then(console.log)




async function test() {
  console.log(11111)
}

const x = () => { test() }
x()