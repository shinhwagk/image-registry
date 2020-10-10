## Table of Contents

- [Getting Started](#getting-started)
  - [pull images from third hub use keyword 'proxy' with hub name](#pull-images-from-third-hub-use-keyword-proxy-with-hub-name)
  - [push image to registry](#push-image-to-registry)
- [directory for filesystem](#directory-for-filesystem)

## Getting Started
```sh
docker run --name registry -d -p 8003:8003 docker.io/shinhwagk/registry
```

### pull images from third hub use keyword 'proxy' with hub name
- quay.io 
```sh
docker pull 127.0.0.1:8003/proxy/quay.io/coreos/etcd-operator:dev
```
- docker.io
```sh
docker pull 127.0.0.1:8003/proxy/docker.io/library/node:14
```

### push image to registry
```sh
docker tag 127.0.0.1:8003/proxy/docker.io/library/node:14 127.0.0.1:8003/library/node:14
docker push 127.0.0.1:8003/library/node:14
```

## directory for filesystem
```
|<daemon>
|________|<image name>
|_____________________|blobs
|___________________________|sha256:xxxxxxxx
|_____________________|manifests
|_______________________________|tags
|____________________________________|<tag>
|__________________________________________|vnd.docker.distribution.manifest.list.v2+json # link to sha256
|__________________________________________|vnd.docker.distribution.manifest.v2+json
|__________________________________________|vnd.docker.distribution.manifest.v1+json
|__________________________________________|...
|_______________________________|sha256
|_____________________________________| sha256:xxx
```
