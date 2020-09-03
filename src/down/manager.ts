
// import { Logger } from 'winston'

import { sleep } from '../helper';
import { DownTask } from './down';
import * as logger from '../logger'

export class DownManager {

    private readonly tasks: DownTask[] = []
    private readonly log = logger.create('DownManager')

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
        console.log('perform', this.tasks.length)
        for (const task of this.tasks.filter(t => t.checkState('none'))) {
            this.log.debug(task.getId() + 'start')
            task.start()
        }
    }

    async wait(t: DownTask): Promise<void> {
        while (t.checkState('running')) {
            this.log.debug('task running ' + t.getId())
            await sleep(2000)
        }
        this.removeTask(t)
        if (t.checkState('failure')) {
            throw new Error(`${t.getId()} error.`)
        }
        this.log.info(t.getId() + ' wait success')
    }
}

export const dmgr = new DownManager();