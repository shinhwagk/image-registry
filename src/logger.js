"use strict";
exports.__esModule = true;
exports.create = void 0;
var winston_1 = require("winston");
var combine = winston_1.format.combine, timestamp = winston_1.format.timestamp, label = winston_1.format.label, printf = winston_1.format.printf;
var constants_1 = require("./constants");
function create(l) {
    var customFormat = printf(function (_a) {
        var level = _a.level, message = _a.message, label = _a.label, timestamp = _a.timestamp;
        return timestamp + " " + level + " [" + label + "]: " + message;
    });
    return winston_1.createLogger({
        format: combine(timestamp(), label({ label: l }), customFormat),
        transports: [new winston_1.transports.Console({ level: constants_1.logLevel })]
    });
}
exports.create = create;
