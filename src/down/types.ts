export type ReqHeader = NodeJS.Dict<string | string[]>;

export type TaskState = 'failure' | 'success' | 'none' | 'running';

export abstract class AbsState {
    state: TaskState = 'none'
    checkState(state: TaskState): boolean {
        return this.state === state
    }
    setState(state: TaskState): void {
        this.state = state
    }
}

export interface ITask {
    start(): Promise<void>
}
