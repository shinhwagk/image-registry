
import * as async from 'async';
// import { Logger } from 'winston'

import { sleep } from '../helper';
import { DownTask } from './task';

function makeTasksQueue() {
    return async.queue<{ task: DownTask }>(({ task }, qcb) => {
        async.retry({ times: 3, interval: 1000 }, (rcb) => {
            task.start()
                .then(() => rcb())
                .catch(e => { console.log('task retry queue: ' + task.getId() + ' ' + e); rcb(e); })
        }).then(() => qcb()).catch((e) => { console.log('task queue: ' + task.getId() + ' ' + e); qcb(e) })
    }, 5);
}

export class DownManager {
    private readonly tasks: DownTask[] = []
    private readonly tasksQueue = makeTasksQueue();

    public addTask(t: DownTask): void {
        for (const tq of this.tasks) {
            if (tq.getId() == t.getId()) {
                return
            }
        }
        this.tasks.push(t)
        this.perform()
    }

    private removeTask(t: DownTask): void {
        const idx = this.tasks.map(t => t.getId()).indexOf(t.getId())
        if (idx >= 0) {
            this.tasks.splice(idx, 1);
        }
    }

    private perform(): void {
        for (const task of this.tasks.filter(t => t.checkState('none'))) {
            this.tasksQueue.push({ task }, (err) => {
                if (err) {
                    console.log('task error' + err)
                    task.setState('failure')
                } else {
                    task.setState('success')
                    console.log('task success')
                }
                this.removeTask(task)
            })
            task.setState('running')
        }
    }

    async wait(t: DownTask): Promise<void> {
        while (t.checkState('running')) {
            // this.log.de('task running ' + t.getId())
            await sleep(2000)
        }
        if (t.checkState('failure')) {
            throw new Error(`${t.getId()} error.`)
        }
    }
}
