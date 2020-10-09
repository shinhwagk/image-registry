import { DownTask, DownTaskConfig } from './down';
import * as logger from '../logger'

export class DownManager {

    private readonly tasks: { [id: string]: Promise<void> } = {}
    private readonly log = logger.newLogger('DownManager')('')

    public addTask(dtc: DownTaskConfig): void {
        const tid = this.getTaskId(dtc)
        if (this.checkTaskRunning(tid)) {
            this.log.info(`${tid} in task list`)
            return
        }
        this.tasks[tid] = (new DownTask(dtc)).start()
        this.log.info(`current task list info`)
    }

    private cleanTask(tid: string): void {
        delete this.tasks[tid]
    }

    private pickTask(tid: string): Promise<void> | undefined {
        return this.tasks[tid]
    }

    private checkTaskRunning(tid: string): boolean {
        return tid in this.tasks
    }

    public async addAndWait(tc: DownTaskConfig): Promise<void> {
        this.addTask(tc)
        await this.wait(tc)
    }

    private getTaskId(dtc: DownTaskConfig): string {
        return dtc.name + '@' + dtc.shasum.substr(0, 19)
    }

    public async wait(tc: DownTaskConfig): Promise<void> {
        const tid = this.getTaskId(tc)
        this.log.debug(tid + ' add to tasklist')
        const ptask = this.pickTask(tid)
        if (!ptask) {
            this.log.info(tid + ' is not in list, might have been completed')
            return
        }
        try {
            await ptask
            this.log.info(tid + ' success\n')
        } catch (e) {
            this.log.info(tid + ' failure: ' + e.message)
            throw new Error(e.message)
        } finally {
            this.cleanTask(tid);
        }
    }
}

export const DownMangerService = new DownManager();