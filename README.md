## Table of Contents

- [Getting Started](#getting-started)

## Getting Started
```sh
git clone --depth=1 https://github.com/registry
cd release
docker-compose up

# test pull image
# quay.io 
docker pull 127.0.0.1:6660/coreos/etcd-operator:dev
# docker.io
docker pull 127.0.0.1:6661/library/node:10
```

