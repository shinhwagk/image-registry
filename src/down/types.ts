export type ReqHeader = NodeJS.Dict<string | string[]>;

export type TaskState = 'failure' | 'success' | 'none' | 'running'