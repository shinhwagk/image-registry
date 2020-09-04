export type ReqHeader = NodeJS.Dict<string | string[]>;

export type TaskState = 'failure' | 'success' | 'none' | 'running';

export abstract class AbsState implements IState {
    state: TaskState = 'none'
    checkState(state: TaskState): boolean {
        return this.state === state
    }
    setState(state: TaskState): void {
        this.state = state
    }
}

export interface IState {
    state: TaskState
    checkState(state: TaskState): boolean
    setState(state: TaskState): void
}

export interface ITask {
    start(): Promise<void>
}
