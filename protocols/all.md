```
serve: /v2/
request GET {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'accept-encoding': 'gzip',
  connection: 'close'
}
server 200 {
  'content-length': '2',
  'content-type': 'application/json; charset=utf-8',
  'docker-distribution-api-version': 'registry/2.0',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:13 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/sha256:8a29a15cefaeccf6545f7ecf11298f9672d2f0cdaf9e357a95133ac3ad3e1f07
request HEAD {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  connection: 'close'
}
server 404 {
  'content-type': 'application/json; charset=utf-8',
  'docker-distribution-api-version': 'registry/2.0',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:13 GMT',
  'content-length': '157',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/uploads/
request POST {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'content-length': '0',
  'content-type': '',
  'accept-encoding': 'gzip',
  connection: 'close'
}
server 202 {
  'content-length': '0',
  'docker-distribution-api-version': 'registry/2.0',
  'docker-upload-uuid': '689f4f6a-42b1-42e1-8549-fdf22d8b61bc',
  location: 'http://127.0.0.1:8000/v2/shinhwagk/test/blobs/uploads/689f4f6a-42b1-42e1-8549-fdf22d8b61bc?_state=qsWre6eZdna8HRM54T3rk-EHe7jJUodzV2yQH1uIJq57Ik5hbWUiOiJzaGluaHdhZ2svdGVzdCIsIlVVSUQiOiI2ODlmNGY2YS00MmIxLTQyZTEtODU0OS1mZGYyMmQ4YjYxYmMiLCJPZmZzZXQiOjAsIlN0YXJ0ZWRBdCI6IjIwMjAtMDktMjFUMDU6MjU6MTMuODA4ODk0M1oifQ%3D%3D',
  range: '0-0',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:13 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/uploads/689f4f6a-42b1-42e1-8549-fdf22d8b61bc?_state=qsWre6eZdna8HRM54T3rk-EHe7jJUodzV2yQH1uIJq57Ik5hbWUiOiJzaGluaHdhZ2svdGVzdCIsIlVVSUQiOiI2ODlmNGY2YS00MmIxLTQyZTEtODU0OS1mZGYyMmQ4YjYxYmMiLCJPZmZzZXQiOjAsIlN0YXJ0ZWRBdCI6IjIwMjAtMDktMjFUMDU6MjU6MTMuODA4ODk0M1oifQ%3D%3D
request PATCH {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'transfer-encoding': 'chunked',
  'accept-encoding': 'gzip',
  connection: 'close'
}
server 202 {
  'content-length': '0',
  'docker-distribution-api-version': 'registry/2.0',
  'docker-upload-uuid': '689f4f6a-42b1-42e1-8549-fdf22d8b61bc',
  location: 'http://127.0.0.1:8000/v2/shinhwagk/test/blobs/uploads/689f4f6a-42b1-42e1-8549-fdf22d8b61bc?_state=62Scfnd8eE_T356pb0O2t9-u6vuUZLdc1i21u1LqmKd7Ik5hbWUiOiJzaGluaHdhZ2svdGVzdCIsIlVVSUQiOiI2ODlmNGY2YS00MmIxLTQyZTEtODU0OS1mZGYyMmQ4YjYxYmMiLCJPZmZzZXQiOjczMjI4NDQ2LCJTdGFydGVkQXQiOiIyMDIwLTA5LTIxVDA1OjI1OjEzWiJ9',
  range: '0-73228445',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/uploads/689f4f6a-42b1-42e1-8549-fdf22d8b61bc?_state=62Scfnd8eE_T356pb0O2t9-u6vuUZLdc1i21u1LqmKd7Ik5hbWUiOiJzaGluaHdhZ2svdGVzdCIsIlVVSUQiOiI2ODlmNGY2YS00MmIxLTQyZTEtODU0OS1mZGYyMmQ4YjYxYmMiLCJPZmZzZXQiOjczMjI4NDQ2LCJTdGFydGVkQXQiOiIyMDIwLTA5LTIxVDA1OjI1OjEzWiJ9&digest=sha256%3A8a29a15cefaeccf6545f7ecf11298f9672d2f0cdaf9e357a95133ac3ad3e1f07
request PUT {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'content-length': '0',
  'accept-encoding': 'gzip',
  connection: 'close'
}
server 201 {
  'content-length': '0',
  'docker-content-digest': 'sha256:8a29a15cefaeccf6545f7ecf11298f9672d2f0cdaf9e357a95133ac3ad3e1f07',
  'docker-distribution-api-version': 'registry/2.0',
  location: 'http://127.0.0.1:8000/v2/shinhwagk/test/blobs/sha256:8a29a15cefaeccf6545f7ecf11298f9672d2f0cdaf9e357a95133ac3ad3e1f07',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/sha256:8a29a15cefaeccf6545f7ecf11298f9672d2f0cdaf9e357a95133ac3ad3e1f07
request HEAD {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  connection: 'close'
}
server 200 {
  'accept-ranges': 'bytes',
  'cache-control': 'max-age=31536000',
  'content-length': '73228446',
  'content-type': 'application/octet-stream',
  'docker-content-digest': 'sha256:8a29a15cefaeccf6545f7ecf11298f9672d2f0cdaf9e357a95133ac3ad3e1f07',
  'docker-distribution-api-version': 'registry/2.0',
  etag: '"sha256:8a29a15cefaeccf6545f7ecf11298f9672d2f0cdaf9e357a95133ac3ad3e1f07"',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/sha256:470671670cac686c7cf0081e0b37da2e9f4f768ddc5f6a26102ccd1c6954c1ee
request HEAD {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  connection: 'close'
}
server 404 {
  'content-type': 'application/json; charset=utf-8',
  'docker-distribution-api-version': 'registry/2.0',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  'content-length': '157',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/uploads/
request POST {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'content-length': '0',
  'content-type': '',
  'accept-encoding': 'gzip',
  connection: 'close'
}
server 202 {
  'content-length': '0',
  'docker-distribution-api-version': 'registry/2.0',
  'docker-upload-uuid': '17db4854-17bc-4830-b426-f7162f51cbbd',
  location: 'http://127.0.0.1:8000/v2/shinhwagk/test/blobs/uploads/17db4854-17bc-4830-b426-f7162f51cbbd?_state=s1TglUolPcFXvHbs3owRZRKKdnew3zo3jUaJCNsTbRl7Ik5hbWUiOiJzaGluaHdhZ2svdGVzdCIsIlVVSUQiOiIxN2RiNDg1NC0xN2JjLTQ4MzAtYjQyNi1mNzE2MmY1MWNiYmQiLCJPZmZzZXQiOjAsIlN0YXJ0ZWRBdCI6IjIwMjAtMDktMjFUMDU6MjU6MjUuNjM3NDE1M1oifQ%3D%3D',
  range: '0-0',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/uploads/17db4854-17bc-4830-b426-f7162f51cbbd?_state=s1TglUolPcFXvHbs3owRZRKKdnew3zo3jUaJCNsTbRl7Ik5hbWUiOiJzaGluaHdhZ2svdGVzdCIsIlVVSUQiOiIxN2RiNDg1NC0xN2JjLTQ4MzAtYjQyNi1mNzE2MmY1MWNiYmQiLCJPZmZzZXQiOjAsIlN0YXJ0ZWRBdCI6IjIwMjAtMDktMjFUMDU6MjU6MjUuNjM3NDE1M1oifQ%3D%3D
request PATCH {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'transfer-encoding': 'chunked',
  'accept-encoding': 'gzip',
  connection: 'close'
}
server 202 {
  'content-length': '0',
  'docker-distribution-api-version': 'registry/2.0',
  'docker-upload-uuid': '17db4854-17bc-4830-b426-f7162f51cbbd',
  location: 'http://127.0.0.1:8000/v2/shinhwagk/test/blobs/uploads/17db4854-17bc-4830-b426-f7162f51cbbd?_state=N3mS1zIQVKZwU0WYOrq1-S_Ug5czG2qAxmdwOkEuUUt7Ik5hbWUiOiJzaGluaHdhZ2svdGVzdCIsIlVVSUQiOiIxN2RiNDg1NC0xN2JjLTQ4MzAtYjQyNi1mNzE2MmY1MWNiYmQiLCJPZmZzZXQiOjI3OTcsIlN0YXJ0ZWRBdCI6IjIwMjAtMDktMjFUMDU6MjU6MjVaIn0%3D',
  range: '0-2796',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/uploads/17db4854-17bc-4830-b426-f7162f51cbbd?_state=N3mS1zIQVKZwU0WYOrq1-S_Ug5czG2qAxmdwOkEuUUt7Ik5hbWUiOiJzaGluaHdhZ2svdGVzdCIsIlVVSUQiOiIxN2RiNDg1NC0xN2JjLTQ4MzAtYjQyNi1mNzE2MmY1MWNiYmQiLCJPZmZzZXQiOjI3OTcsIlN0YXJ0ZWRBdCI6IjIwMjAtMDktMjFUMDU6MjU6MjVaIn0%3D&digest=sha256%3A470671670cac686c7cf0081e0b37da2e9f4f768ddc5f6a26102ccd1c6954c1ee
request PUT {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'content-length': '0',
  'accept-encoding': 'gzip',
  connection: 'close'
}
server 201 {
  'content-length': '0',
  'docker-content-digest': 'sha256:470671670cac686c7cf0081e0b37da2e9f4f768ddc5f6a26102ccd1c6954c1ee',
  'docker-distribution-api-version': 'registry/2.0',
  location: 'http://127.0.0.1:8000/v2/shinhwagk/test/blobs/sha256:470671670cac686c7cf0081e0b37da2e9f4f768ddc5f6a26102ccd1c6954c1ee',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/blobs/sha256:470671670cac686c7cf0081e0b37da2e9f4f768ddc5f6a26102ccd1c6954c1ee
request HEAD {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  connection: 'close'
}
server 200 {
  'accept-ranges': 'bytes',
  'cache-control': 'max-age=31536000',
  'content-length': '2797',
  'content-type': 'application/octet-stream',
  'docker-content-digest': 'sha256:470671670cac686c7cf0081e0b37da2e9f4f768ddc5f6a26102ccd1c6954c1ee',
  'docker-distribution-api-version': 'registry/2.0',
  etag: '"sha256:470671670cac686c7cf0081e0b37da2e9f4f768ddc5f6a26102ccd1c6954c1ee"',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  connection: 'close'
}
serve: /v2/shinhwagk/test/manifests/latest
request PUT {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'content-length': '529',
  'content-type': 'application/vnd.docker.distribution.manifest.v2+json',
  'accept-encoding': 'gzip',
  connection: 'close'
}
server 201 {
  'docker-content-digest': 'sha256:9e0c275e0bcb495773b10a18e499985d782810e47b4fce076422acb4bc3da3dd',
  'docker-distribution-api-version': 'registry/2.0',
  location: 'http://127.0.0.1:8000/v2/shinhwagk/test/manifests/sha256:9e0c275e0bcb495773b10a18e499985d782810e47b4fce076422acb4bc3da3dd',
  'x-content-type-options': 'nosniff',
  date: 'Mon, 21 Sep 2020 05:25:25 GMT',
  'content-length': '0',
  connection: 'close'
}
```