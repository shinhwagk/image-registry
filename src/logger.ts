// import { createLogger, format, transports, Logger } from 'winston'
// const { combine, timestamp, label, printf } = format;

// import { logLevel } from './constants'

// export function create(l: string): Logger {
//     const customFormat = printf(({ level, message, label, timestamp }) => `${timestamp} ${level} [${label}]: ${message}`);
//     return createLogger({
//         format: combine(
//             timestamp(),
//             label({ label: l }),
//             customFormat
//         ),
//         transports: [new transports.Console({ level: logLevel })]
//     })
// }