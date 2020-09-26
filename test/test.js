const fs = require('fs')
const spawn = require('child_process').spawn

const data = JSON.parse(fs.readFileSync('./test/data.json', { encoding: 'utf8' }))

for (const [k, v] of Object.entries(data.push)) {
    const daemon = spawn('docker', [bootstrap]);
}