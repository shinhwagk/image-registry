import * as async from 'async';

import { ITask } from './types';
import { sleep } from '../helper';
import { logLevel } from '../constants';

function makeTasksQueue(qc: number, rc: number, ri: number): async.AsyncQueue<{ task: ITask }> {
    return async.queue<{ task: ITask }>(({ task }, qcb) => {
        async.retry({ times: rc, interval: ri }, (rcb) => {
            task.start()
                .then(() => rcb())
                .catch((e) => { console.log(`worker error ${e.message} xxxxxxxxxxxx`); rcb(e.message) })
        }).then(() => qcb()).catch((e) => qcb(e.message))
    }, qc);
}

export const chunksQueue = makeTasksQueue(10, 10, 1000);

if (logLevel === 'debug') {
    (async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await sleep(1000)
            console.log('###################queue length ' + chunksQueue.length())
            console.log('###################queue running ' + chunksQueue.running())
            console.log('###################queue workersList ' + chunksQueue.workersList().length)
        }
    })()
}