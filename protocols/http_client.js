const got = require('got');
(async () => {
    const res = await got.get('https://registry-1.docker.io/v2', { throwHttpErrors: false })
    console.log(res.headers)
    console.log(res)
})()