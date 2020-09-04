
// import { Logger } from 'winston'

import { sleep } from '../helper';
import { DownTask } from './down';
import * as logger from '../logger'

export class DownManager {

    private readonly tasks: DownTask[] = []
    private readonly log = logger.create('DownManager')

    public addTask(t: DownTask): void {
        if (this.tasks.filter(task => task.getId() === t.getId()).length === 1) {
            this.log.info(`${t.getId()} in task list`)
            return
        }
        this.tasks.push(t)

        this.perform()
    }

    public removeTask(t: DownTask): void {
        const idx = this.tasks.map(t => t.getId()).indexOf(t.getId())
        if (idx >= 0) {
            this.tasks.splice(idx, 1);
        }
    }

    private perform(): void {
        for (const task of this.tasks.filter(t => t.checkState('none'))) {
            this.log.debug(task.getId() + ' start')
            task.setState('running')
            task.start()
        }
    }

    private checkTaskIsRunning(task: DownTask): boolean {
        return this.tasks.filter(task => task.checkState('running')).map(task => task.getId()).includes(task.getId())
    }

    async wait(t: DownTask): Promise<void> {
        this.log.debug(t.getId() + ' add to tasklist')
        this.addTask(t)

        while (this.checkTaskIsRunning(t)) {
            this.log.debug('task state check running ' + t.getId())
            await sleep(5000)
        }
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', t.state)

        this.removeTask(t)
        if (t.checkState('success')) {
            this.log.info(t.getId() + ' success')
            return
        }

        if (t.checkState('failure')) {
            throw new Error(`${t.getId()} error.`)
        }
        this.log.info(t.getId() + ' wait success')
    }
}

export const dmgr = new DownManager();