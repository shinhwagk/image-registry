
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
    }, 1);
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

    private checkTaskRunning(t: DownTask): boolean {
        return t.getId() in this.tasksQueue.workersList().map(w => w.data.task.getId())
    }

    private perform(): void {
        (async () => {
            for (const task of this.tasks) {
                if (this.checkTaskRunning(task)) {
                    console.log('task is running')
                    continue;
                }
                this.tasksQueue.push({ task }, (err) => {
                    if (err) {
                        task.setState('failure')
                    } else {
                        task.setState('success')
                        console.log('task success')
                    }
                    this.removeTask(task)
                })
                await sleep(1000)
            }
        })()
    }

    async wait(t: DownTask): Promise<void> {
        while (this.checkTaskRunning(t)) {
            console.log('task running ' + t.getId())
            await sleep(2000)
        }
        if (t.getState() === 'failure') {
            throw new Error(`${t.getId()} error.`)
        }
    }
}
