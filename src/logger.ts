import { createLogger, format, transports, Logger } from 'winston'

import { envLogLevel } from './constants'

const { combine, timestamp, printf } = format;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const create = (module: string) => (task?: string) => {
    const _task = task ? `[${task}]` : ''
    const customFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level} [${module}]${_task}: ${message}`);
    return createLogger({
        format: combine(
            timestamp(),
            customFormat
        ),
        transports: [new transports.Console({ level: envLogLevel })]
    })
}