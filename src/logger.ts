import { createLogger, format, transports } from 'winston'
const { combine, timestamp, label, printf } = format;

import { logLevel } from './constants'

export function create(name: string, sha256: string) {
    const customFormat = printf(({ level, message, timestamp }) => `${timestamp} [${name}][${sha256}] ${level}: ${message}`);
    return createLogger({
        format: combine(
            timestamp(),
            customFormat
        ),
        transports: [new transports.Console({ level: logLevel })]
    })
}