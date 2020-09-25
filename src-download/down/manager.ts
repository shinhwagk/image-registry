import { DownTask } from './down';
import * as logger from '../logger'

export class DownManager {

    private readonly tasks: { [id: string]: { running: Promise<void>, count: number } } = {}
    private readonly log = logger.create('DownManager')

    public addTask(t: DownTask): void {
        if (this.checkTaskRunning(t)) {
            this.log.info(`${t.getId()} in task list`)
            this.tasks[t.getId()].count += 1
            return
        }
        this.tasks[t.getId()] = { running: t.start(), count: 1 }

        const reqSum = Object.values(this.tasks).map(v => v.count).reduce((a, b) => a + b, 0)
        this.log.info(`current task list info: ${Object.keys(this.tasks).length}/${reqSum}`)
    }

    public cleanTask(tid: string): void {
        this.tasks[tid].count -= 1;
        if (this.tasks[tid].count === 0) {
            delete this.tasks[tid]
        }
    }

    private pickTask(tid: string): Promise<void> {
        return this.tasks[tid].running
    }

    private checkTaskRunning(t: DownTask): boolean {
        return t.getId() in this.tasks
    }

    async wait(t: DownTask): Promise<void> {
        this.addTask(t)
        const tid = t.getId()
        this.log.debug(tid + ' add to tasklist')
        const ptask = this.pickTask(tid)
        try {
            await ptask
            this.log.info(tid + ' success')
        } catch (e) {
            this.log.info(tid + ' failure: ' + e.message)
            throw new Error(e.message)
        } finally {
            this.cleanTask(tid);
        }
    }
}

export const dmgr = new DownManager();