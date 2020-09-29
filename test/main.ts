import chunk from './down/chunk.test'
import down from './down/down.test'
import manager from './down/manager.test'
import client from './client.test'

(async () => {
    for (const unitTest of []
        // .concat(chunk)
        // .concat(down)
        // .concat(manager)
        .concat(client)
    ) {
        await unitTest()
    }
})()