## Table of Contents

- [Getting Started](#getting-started)

## Getting Started
```sh
git clone --depth=1 https://github.com/registry
cd registry/exmaple

docker volume create registry-cache
docker-compose up

# pull images from third proe use keyword 'proxy' with repo name
## quay.io 
docker pull 127.0.0.1:6660/proxy/quay.io/coreos/etcd-operator:dev
## docker.io
docker pull 127.0.0.1:6661/proxy/docker.io/library/node:10
```

## directory for filesystem
```
|<name>
|____|blobs
|__________|sha256:xxxxxxxx
|____|manifests
|_____________|tags
|_________________|vnd.docker.distribution.manifest.list.v2+json # link to sha256
|_________________|vnd.docker.distribution.manifest.v2+json
|_________________|vnd.docker.distribution.manifest.v1+json
|_____________|sha256
|____________________| sha256:xxx

```