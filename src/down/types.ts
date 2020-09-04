export type ReqHeader = NodeJS.Dict<string | string[]>;

export interface ITask {
    start(): Promise<void>
}
