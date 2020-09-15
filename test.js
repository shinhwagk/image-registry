const got = require('got');
const fs = require('fs');

let writeStream;

const fn = (retryCount = 0) => {
    console.log('11111111111111111')
    const stream = got.stream('https://google.com');
    stream.on('request', request => setTimeout(() => request.destroy(), 1150));
    stream.retryCount = retryCount;
    stream.on('error', () => console.log("2222222"))

    if (writeStream) {
        writeStream.destroy();
    }

    writeStream = fs.createWriteStream('example.com');

    stream.pipe(writeStream);

    stream.once('retry', fn);
};

fn(5);