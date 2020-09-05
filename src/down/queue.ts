import * as async from 'async';

import { ITask } from './types';
import { sleep } from '../helper';
import { logLevel } from '../constants';
import { create } from '../logger';


const log = create('queue')

function makeTasksQueue(qc: number, rt: number, ri: number): async.AsyncQueue<{ task: ITask }> {
    return async.queue<{ task: ITask }>(({ task }, qcb) => {
        async.retry({ times: rt, interval: ri }, (rcb) => {
            task.start()
                .then(() => rcb())
                .catch((e) => { log.info(`worker error ${e.message}`); rcb(e.message) })
        }).then(() => qcb()).catch((e) => qcb(e.message))
    }, qc);
}

export const chunksQueue = makeTasksQueue(10, 10, 1000);

if (logLevel === 'debug') {
    (async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await sleep(1000)
            log.debug('length ' + chunksQueue.length() + '|running ' + chunksQueue.running())
        }
    })()
}