const url = require('url')
const p = '/v2/shinhwagk/test4/blobs/uploads/d8a14da7-1825-4a87-87b7-662eea78d041?digest=sha256%3Ad85174a871441e82995f5577b3bbd247e53ed25d5a75a709b3b63a638c07457f'
console.log(url.parse(p))