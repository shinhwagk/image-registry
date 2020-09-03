import { createLogger, format, transports, Logger } from 'winston'

import { logLevel } from './constants'

const { combine, timestamp, printf } = format;

export function create(module: string,): Logger {
    const customFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level} [${module}]: ${message}`);
    return createLogger({
        format: combine(
            timestamp(),
            // label({ label: l }),
            customFormat
        ),
        transports: [new transports.Console({ level: logLevel })]
    })
}