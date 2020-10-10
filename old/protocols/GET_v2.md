# docker cli
# https://registry-1.docker.io/v2
## in
```
url /v2/
method GET
headers {
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  'accept-encoding': 'gzip',
  connection: 'close'

no body
```

## out
```
'content-type': 'application/json',
'docker-distribution-api-version': 'registry/2.0',
'www-authenticate': 'Bearer realm="https://auth.docker.io/token",service="registry.docker.io"',
date: 'Thu, 17 Sep 2020 00:39:55 GMT',
'content-length': '87',
connection: 'close',
'strict-transport-security': 'max-age=31536000'

body
{"errors":[{"code":"UNAUTHORIZED","message":"authentication required","detail":null}]}
```



auth 
```
{
  host: '127.0.0.1:8000',
  'user-agent': 'docker/19.03.12 go/go1.13.10 git-commit/48a66213fe kernel/4.19.84-microsoft-standard os/linux arch/amd64 UpstreamClient(Docker-Client/19.03.12 \\(linux\\))',
  accept: 'application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v1+prettyjws, application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json',
  authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJkZDZjMGQxYzcyMGEyMjc3ZDMwYzU1NWUzMTk1NWVlYjMxMGUzYWFjMjU1ZjNjMDY3MTFkNTQzYTkyZTMzNWMifQ.eyJhY2Nlc3MiOlt7InR5cGUiOiJyZXBvc2l0b3J5IiwibmFtZSI6Im9wZW5zaGlmdC9va2QiLCJhY3Rpb25zIjpbInB1bGwiXX1dLCJjb250ZXh0Ijp7ImNvbS5hcG9zdGlsbGUucm9vdHMiOnsib3BlbnNoaWZ0L29rZCI6IiRkaXNhYmxlZCJ9LCJjb20uYXBvc3RpbGxlLnJvb3QiOiIkZGlzYWJsZWQifSwiYXVkIjoicXVheS5pbyIsImV4cCI6MTYwMDMxNDQ4OCwiaXNzIjoicXVheSIsImlhdCI6MTYwMDMxMDg4OCwibmJmIjoxNjAwMzEwODg4LCJzdWIiOiIoYW5vbnltb3VzKSJ9.D0PbAmqqvwnc1HiG3Q-264PlMYuNSKXAkbc-9_6P1wj3lS9ebUGp5RZfPz3R5BTDEb1MdI9-VWE7JmpwyedzLRh_Bu_mYUYS9kIwjsAOyXafIj7pjWT8P2qrdu34qdK5jCRJDunqU_ifp8pM6ELnGdWbbuPZXvsP5Bf7LuzDTQrD3rwMcP4670M_IwAog5aYOOvqdFToYCgPRrHqv-WCjvBeD8G0jb8L3brY49hPPVJ91NWR4_BcG2h3lj6sIMkYSsz6zGSpcjK7gO2Uy1S-7CGkg98IGnohfhkNmCTVcfB2gUdisypH87FrTLHcFXFGX9qisbywGUmkMls-kHnCQQ',
  'accept-encoding': 'gzip',
  connection: 'close'
}
```