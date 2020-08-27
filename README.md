1. GET /v2/
```
HTTP/2 401
server: nginx/1.12.1
date: Thu, 27 Aug 2020 02:54:15 GMT
content-type: text/html; charset=utf-8
content-length: 4
docker-distribution-api-version: registry/2.0
www-authenticate: Bearer realm="https://quay.io/v2/auth",service="quay.io"
```
2. GET /v2/library/node/manifests/12
```
no exist
HTTP/2 404
server: nginx/1.12.1
date: Thu, 27 Aug 2020 02:53:29 GMT
content-type: application/json
content-length: 82

{"errors":[{"code":"MANIFEST_UNKNOWN","detail":{},"message":"manifest unknown"}]}

exist
HTTP/2 200
server: nginx/1.12.1
date: Thu, 27 Aug 2020 02:53:38 GMT
content-type: application/vnd.docker.distribution.manifest.v1+json
content-length: 7339
docker-content-digest: sha256:433c44794ffe3a4b7ba7d4444d8d1b82743b24c4ccf8024bab252f76e37fa1bf
x-frame-options: DENY
strict-transport-security: max-age=63072000; preload

{
   "schemaVersion": 1,
   "tag": "4.5.0-0.okd-2020-08-12-020541-coredns",
   "name": "openshift/okd-content",
   "architecture": "amd64",
   "fsLayers": [
      {
         "blobSum": "sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95"
      },
      {
         "blobSum": "sha256:455a6ebc360e2132a2e9596d198d34c3521418ef735bdb981e492d49608fe050"
      },
      {
         "blobSum": "sha256:82cabd2585ea5cd94a0b3a4d581f2747a9e9ab585416d84f810dd47570d023a7"
      },
      {
         "blobSum": "sha256:82a8f4ea76cb6f833c5f179b3e6eda9f2267ed8ac7d1bf652f88ac3e9cc453d1"
      },
      {
         "blobSum": "sha256:a3ac36470b00df382448e79f7a749aa6833e4ac9cc90e3391f778820db9fa407"
      }
   ],
   "history": [
      {
         "v1Compatibility": "{\"container\": \"6b69e2c26f97784c683c67b1b1f5d6431411e93920f4a00522ec62c44f851318\", \"parent\": \"1304fd9a7f2144a776d72fa436c3fd18be245e04ece8a648e278297a985fd988\", \"created\": \"2020-06-18T19:57:57.153398302Z\", \"config\": {\"Tty\": false, \"Hostname\": \"dcdaa3322a97\", \"Env\": [\"foo=bar\", \"OPENSHIFT_BUILD_NAME=coredns\", \"OPENSHIFT_BUILD_NAMESPACE=ci-op-n1dz5y26\", \"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\", \"container=oci\"], \"Domainname\": \"\", \"StdinOnce\": false, \"Image\": \"\", \"Cmd\": null, \"WorkingDir\": \"\", \"ArgsEscaped\": true, \"Labels\": {\"io.k8s.description\": \"CoreDNS delivers the DNS and Discovery Service for a Kubernetes cluster.\", \"maintainer\": \"dev@lists.openshift.redhat.com\", \"version\": \"7.8\", \"io.openshift.build.commit.message\": \"\", \"io.openshift.build.commit.author\": \"\", \"com.redhat.license_terms\": \"https://www.redhat.com/en/about/red-hat-end-user-license-agreements#UBI\", \"vcs-ref\": \"4c4a96ae422f60e5764065aa1230f3f004b19427\", \"io.k8s.display-name\": \"CoreDNS\", \"io.openshift.build.source-context-dir\": \"\", \"io.openshift.build.namespace\": \"\", \"io.openshift.build.commit.date\": \"\", \"io.openshift.build.name\": \"\", \"vcs-url\": \"https://github.com/openshift/coredns\", \"com.redhat.component\": \"ubi7-container\", \"distribution-scope\": \"public\", \"vendor\": \"Red Hat, Inc.\", \"description\": \"The Universal Base Image is designed and engineered to be the base layer for all of your containerized applications, middleware and utilities. This base image is freely redistributable, but Red Hat only supports Red Hat technologies through subscriptions for Red Hat products. This image is maintained by Red Hat and updated regularly.\", \"io.openshift.build.commit.ref\": \"release-4.5\", \"vcs-type\": \"git\", \"com.redhat.build-host\": \"cpt-1008.osbs.prod.upshift.rdu2.redhat.com\", \"build-date\": \"2020-05-11T17:22:15.219602\", \"name\": \"ubi7\", \"url\": \"https://access.redhat.com/containers/#/registry.access.redhat.com/ubi7/images/7.8-311\", \"io.openshift.build.source-location\": \"https://github.com/openshift/coredns\", \"summary\": \"Provides the latest release of the Red Hat Universal Base Image 7.\", \"architecture\": \"x86_64\", \"io.openshift.build.commit.id\": \"4c4a96ae422f60e5764065aa1230f3f004b19427\", \"release\": \"311\", \"io.openshift.tags\": \"base rhel7\"}, \"AttachStdin\": false, \"User\": \"\", \"Volumes\": null, \"Entrypoint\": [\"/usr/bin/coredns\"], \"OnBuild\": null, \"AttachStderr\": false, \"AttachStdout\": false, \"OpenStdin\": false}, \"container_config\": {\"Tty\": false, \"Hostname\": \"6b69e2c26f97\", \"Env\": [\"foo=bar\", \"OPENSHIFT_BUILD_NAME=base\", \"OPENSHIFT_BUILD_NAMESPACE=ci-op-szy2lgxc\", \"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\", \"container=oci\"], \"Domainname\": \"\", \"StdinOnce\": false, \"Image\": \"docker-registry.default.svc:5000/ci-op-n1dz5y26/pipeline@sha256:924f9f0df5e7d2abcdf1d51e21f8e90ca94f332adaa3680fdd5c611976f75950\", \"Cmd\": null, \"WorkingDir\": \"\", \"Labels\": {\"io.k8s.description\": \"This is the base image from which all OpenShift images inherit.\", \"io.openshift.build.commit.author\": \"\", \"version\": \"7.8\", \"io.openshift.build.commit.message\": \"\", \"com.redhat.license_terms\": \"https://www.redhat.com/en/about/red-hat-end-user-license-agreements#UBI\", \"vcs-ref\": \"6cdb5d360768d8f87a615286180e46784ae7d28f\", \"io.k8s.display-name\": \"OpenShift Base\", \"io.openshift.build.source-context-dir\": \"base/\", \"io.openshift.build.namespace\": \"\", \"io.openshift.build.commit.date\": \"\", \"io.openshift.build.name\": \"\", \"vcs-url\": \"https://github.com/openshift/images\", \"com.redhat.component\": \"ubi7-container\", \"distribution-scope\": \"public\", \"vendor\": \"Red Hat, Inc.\", \"description\": \"The Universal Base Image is designed and engineered to be the base layer for all of your containerized applications, middleware and utilities. This base image is freely redistributable, but Red Hat only supports Red Hat technologies through subscriptions for Red Hat products. This image is maintained by Red Hat and updated regularly.\", \"io.openshift.build.commit.ref\": \"release-4.5\", \"vcs-type\": \"git\", \"com.redhat.build-host\": \"cpt-1008.osbs.prod.upshift.rdu2.redhat.com\", \"build-date\": \"2020-05-11T17:22:15.219602\", \"name\": \"ubi7\", \"url\": \"https://access.redhat.com/containers/#/registry.access.redhat.com/ubi7/images/7.8-311\", \"io.openshift.build.source-location\": \"https://github.com/openshift/images\", \"summary\": \"Provides the latest release of the Red Hat Universal Base Image 7.\", \"architecture\": \"x86_64\", \"io.openshift.build.commit.id\": \"6cdb5d360768d8f87a615286180e46784ae7d28f\", \"release\": \"311\", \"io.openshift.tags\": \"base rhel7\"}, \"AttachStdin\": false, \"User\": \"\", \"Volumes\": null, \"Entrypoint\": [\"/bin/sh\", \"-c\", \"#(imagebuilder)\"], \"OnBuild\": null, \"AttachStderr\": false, \"AttachStdout\": false, \"OpenStdin\": false}, \"Size\": 24026559, \"architecture\": \"amd64\", \"docker_version\": \"1.13.1\", \"os\": \"linux\", \"id\": \"353c7d2cac9f668dec1351df134daace8caf012755939cf984a3d0183fc0c0eb\"}"
      },
      {
         "v1Compatibility": "{\"container_config\": {\"Cmd\": [\"#(imagebuilder)\\nsleep 86400\"]}, \"Size\": 8228140, \"id\": \"1304fd9a7f2144a776d72fa436c3fd18be245e04ece8a648e278297a985fd988\", \"parent\": \"462ebf122ed966f29fa7d2ed2ee71473131875dbb57241790edaa9daaa5feaf5\", \"created\": \"2020-06-12T00:01:09.839296714Z\"}"
      },
      {
         "v1Compatibility": "{\"container_config\": {\"Cmd\": [\"#(imagebuilder)\\nsleep 86400\"]}, \"Size\": 385, \"id\": \"462ebf122ed966f29fa7d2ed2ee71473131875dbb57241790edaa9daaa5feaf5\", \"parent\": \"9173109d36b5d18ea17f8739ec55bf10e6177c04bc1d8b6c5144eb635cacee5b\", \"created\": \"2020-06-11T23:59:16.914187212Z\"}"
      },
      {
         "v1Compatibility": "{\"container_config\": {\"Cmd\": [null]}, \"Size\": 1598, \"id\": \"9173109d36b5d18ea17f8739ec55bf10e6177c04bc1d8b6c5144eb635cacee5b\", \"parent\": \"9132b3912eca90ca89a802746930ac3eaa2b3d4c42075079acc1c2f3da6a97b5\", \"created\": \"2020-05-11T17:22:52.084344Z\"}"
      },
      {
         "v1Compatibility": "{\"comment\": \"Imported from -\", \"container_config\": {\"Cmd\": [null]}, \"Size\": 76275160, \"id\": \"9132b3912eca90ca89a802746930ac3eaa2b3d4c42075079acc1c2f3da6a97b5\", \"created\": \"2020-05-11T17:22:43.455017502Z\"}"
      }
   ]
}
```

## by sha256
```
request 
headers {
  host: '127.0.0.1:8888',
  'user-agent': 'Go-http-client/1.1',
  accept: 'application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.v1+prettyjws, application/vnd.docker.distribution.manifest.v1+json, application/vnd.docker.distribution.manifest.list.v2+json',
  'docker-distribution-api-version': 'registry/2.0',
  'accept-encoding': 'gzip',
  connection: 'close'
}

reponce
HTTP/2 200
server: nginx/1.12.1
date: Thu, 27 Aug 2020 09:09:33 GMT
content-type: application/vnd.docker.distribution.manifest.v2+json
content-length: 736
docker-content-digest: sha256:8cf7e06dd4095f2cd54e13fdb6fd313abbeb6e03d568f17956d97433623093c2
x-frame-options: DENY
strict-transport-security: max-age=63072000; preload

{
   "schemaVersion": 2,
   "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
   "config": {
      "mediaType": "application/vnd.docker.container.image.v1+json",
      "size": 1730,
      "digest": "sha256:6bb361fc269add772a5c61e3a78ce2081559b5605f0c9e446c7b23adb7984714" // images id
   },
   "layers": [
      {
         "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
         "size": 32,
         "digest": "sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1"
      },
      {
         "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
         "size": 926491594,
         "digest": "sha256:89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c"
      }
   ]
}s
```

3. download blob
```
url /v2/openshift/okd-content/blobs/sha256:70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95
method GET
headers {
  host: '127.0.0.1:8888',
  'user-agent': 'Go-http-client/1.1',
  'docker-distribution-api-version': 'registry/2.0',
  'accept-encoding': 'gzip',
  connection: 'close'
}
body

下载403 416 重新获取重定向地址
```


## notes
### quay.io 
- quay.io 的分段下载是从0开始
- range: 1-100 表100已经在里面的，下次从101开始