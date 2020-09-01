import * as stream from 'stream';
import { promisify } from 'util';
import * as path from 'path';

import * as fs from 'fs-extra';
import got from 'got';
import * as async from 'async';
// import { Logger } from 'winston'

import { sleep, mergeFile } from './helper';
import { chunkSize } from './constants'
import * as Logger from './logger'


type ReqHeader = NodeJS.Dict<string | string[]>;

export interface DownManagerOption {
    overlay: boolean;
}


function makeTasksQueue() {
    return async.queue<{ task: DownTask }>(({ task }, callback) => {
        async.retry({ times: 10, interval: 1000 }, (cb) => {
            task.start().then(() => cb()).catch(err => (cb(err)))
        }).then(() => callback()).catch((e) => callback(e))
    }, 1);
}


export class DownManager {
    private readonly taskQueue: DownTask[] = []
    // public readonly cacheDest: string;
    // public readonly goalFile: string;

    private readonly tasksQueue = makeTasksQueue();

    // constructor() {
    //     this.cacheDest = `${this.dest}/cache`
    //     this.goalFile = `${this.dest}/${name}`
    // }
    // static create(url: string, headers: ReqHeader, dest: string, name: string, goalName: string, sha256: string): DownManager {
    //     const l = logger.create('DownManager' + ' ' + name + ' ' + sha256.substr(0, 12))
    //     return new DownManager(url, headers, dest, goalName, sha256, l)
    // }

    public addTask(t: DownTask): void {
        // const tId: string = t.getId()
        for (const tq of this.taskQueue) {
            if (tq.getId() == t.getId()) {
                return
            }
        }
        this.taskQueue.push(t)
    }

    public removeTask(t: DownTask): void {
        const index = this.taskQueue.map(t => t.getId()).indexOf(t.getId())
        if (index >= 0) {
            this.taskQueue.splice(index, 1);
        }
    }

    public async perform(): Promise<void> {
        for (const task of this.taskQueue) {
            if (task.getId() in this.tasksQueue.workersList().map(w => w.data.task.getId())) {
                continue;
            }
            this.tasksQueue.push({ task }, (err) => {
                if (err) {
                    console.log(err)
                }
                this.removeTask(task)
            })
            await sleep(1000)
        }
    }

    async wait(taskId: string): Promise<void> {
        while (taskId in this.taskQueue) {
            await sleep(1000)
        }

    }

    // async scheduleWorkers(dt: DownTask): Promise<void> {
    //     let successes = 0
    //     console.log('chunk url ', dt.url)
    //     const q = async.queue<{ i: string, e: number, s: number }>((t, callback) => {
    //         async.retry({ times: 10, interval: 1000 }, (cb) => {
    //             DownWorker
    //                 .create(dt.url, this.headers, this.cacheDest, Number(t.i), t.e - t.s)
    //                 .down()
    //                 .then(() => cb())
    //                 .catch((e) => { console.log(`worker error ${e}`); cb(e) })
    //         }).then(() => callback()).catch((e) => callback(e))
    //     }, 10);

    //     for (const [i, [s, e]] of Object.entries(await dt.getChunks())) {
    //         q.push({ i, s, e }, (err) => {
    //             if (!err) {
    //                 successes += 1
    //                 this.logger.info(`progress: ${successes}/${Object.keys(this.chunks).length}`)
    //             }
    //         });
    //     }
    //     await q.drain();
    // }

    // async combineChunks(): Promise<void> {
    //     this.cleanGoal()
    //     for (const cf of Object.keys(this.chunks).map((id) => `${this.cacheDest}/${id}`)) {
    //         await mergeFile(cf, this.goalFile)
    //     }
    //     this.logger.info('combine chunks success.')
    // }

    // private cleanGoal() {
    //     fs.removeSync(`${this.goalFile}`)
    // }

    // private cleanCache() {
    //     fs.rmdirSync(`${this.cacheDest}`, { recursive: true })
    // }

    // public markSuccess(id: number) {
    //     this.chunks[id][2] = 1
    // }

    // private addLock() {
    //     fs.writeFileSync(`${this.cacheDest}/lock`, '', { encoding: 'utf8' })
    // }

    // private async checksha256() {
    //     const goalSha256 = await sha256sum(this.goalFile)
    //     this.logger.info(`sha256: ${goalSha256.substr(0, 12)} - ${this.sha256.substr(0, 12)}`)
    //     return (goalSha256) === this.sha256
    // }

    // async start(): Promise<void> {
    //     this.logger.info('start')
    //     this.initDirs()
    //     const goalBytes = await this.reqGoalSize()
    //     console.log(`size: ${goalBytes}`)
    //     this.logger.info(`size: ${goalBytes}`)
    //     this.computeChunks(goalBytes)
    //     this.logger.info(`chunks: ${Object.keys(this.chunks).length}`)
    //     await this.scheduleWorkers()
    //     await this.combineChunks()
    //     if (await this.checksha256()) {
    //         this.cleanCache()
    //     } else {
    //         await sleep(1000)
    //         this.logger.info(`retry.`)
    //         await this.start()
    //     }
    //     this.logger.info('success')
    // }
}

