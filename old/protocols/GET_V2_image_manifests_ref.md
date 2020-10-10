## in
```
url /v2/library/abc/manifests/latest
method GET
headers {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  accept: 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v1+prettyjws',
  'accept-encoding': 'gzip',
  connection: 'close'
}
```

## out
```
server: 'nginx/1.12.1',
date: 'Thu, 17 Sep 2020 02:39:32 GMT',
'content-type': 'application/vnd.docker.distribution.manifest.v2+json',
'content-length': '1577',
connection: 'close',
'docker-content-digest': 'sha256:eeb7ba7c0ca5749f2e27e0951da70263658301f5bfa4fdd86524d73bfdeb7cac',
'x-frame-options': 'DENY',
'strict-transport-security': 'max-age=63072000; preload'

body
{
  schemaVersion: 2,
  mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
  config: {
    mediaType: 'application/vnd.docker.container.image.v1+json',
    size: 1351,
    digest: 'sha256:afd5205508db5a99d2ffddef354e8560587ca0b6841f630aa1451d23229f8624'
  },
  layers: [
    {
      mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
      size: 76244414,
      digest: 'sha256:a03401a44180b6581a149376d6fd2d5bd85d938445fd5b5ad270e14ddde4937c'
    },
    {
      mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
      size: 1730,
      digest: 'sha256:bb0da44cdbced801240e74437a617d4fe0e39c29cf3bbabb7f6a96d2620cfeaa'
    },
    {
      mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
      size: 384,
      digest: 'sha256:5f87fb0c9624bba366acfe0cb59f1fefac9dc2b4e2fee6f5ef5b057465b03b04'
    },
    {
      mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
      size: 9585434,
      digest: 'sha256:309f2519e870c162bdda3f7dc22fa0e7b8b278b59c4c366731b84dafa34b57bd'
    },
    {
      mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
      size: 19528076,
      digest: 'sha256:7d47363e2d6b0df01166d53ea61fe7142388eb7247c39d2020774eb414547d16'
    },
    {
      mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
      size: 282900,
      digest: 'sha256:2a11fa068f3c8f851d83711fb5c051e4e82914087bba6ea898ac2995b46ad24c'
    }
  ]
}
```