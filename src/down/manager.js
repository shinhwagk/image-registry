"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.DownManager = void 0;
var async = require("async");
// import { Logger } from 'winston'
var helper_1 = require("./helper");
function makeChunkWorkers() {
    return async.queue(function (t, callback) {
        async.retry({ times: 10, interval: 1000 }, function (cb) {
            DownWorker
                .create(t.id, t.url, t.auth, t.dest, t.r_start, t.r_end)
                .down()
                .then(function () { return cb(); })["catch"](function (e) { console.log("worker error " + e); cb(e); });
        }).then(function () { return callback(); })["catch"](function (e) { return callback(e); });
    }, 10);
}
function makeTaskWorkers() {
    return async.queue(function (_a, callback) {
        var task = _a.task;
        async.retry({ times: 10, interval: 1000 }, function (cb) {
            task.start().then(function () { return cb(); })["catch"](function (err) { return (cb(err)); });
        }).then(function () { return callback(); })["catch"](function (e) { return callback(e); });
    }, 1);
}
var DownManager = /** @class */ (function () {
    function DownManager() {
        this.taskQueue = [];
        // public readonly cacheDest: string;
        // public readonly goalFile: string;
        this.taskWorkers = makeTaskWorkers();
        // async scheduleWorkers(dt: DownTask): Promise<void> {
        //     let successes = 0
        //     console.log('chunk url ', dt.url)
        //     const q = async.queue<{ i: string, e: number, s: number }>((t, callback) => {
        //         async.retry({ times: 10, interval: 1000 }, (cb) => {
        //             DownWorker
        //                 .create(dt.url, this.headers, this.cacheDest, Number(t.i), t.e - t.s)
        //                 .down()
        //                 .then(() => cb())
        //                 .catch((e) => { console.log(`worker error ${e}`); cb(e) })
        //         }).then(() => callback()).catch((e) => callback(e))
        //     }, 10);
        //     for (const [i, [s, e]] of Object.entries(await dt.getChunks())) {
        //         q.push({ i, s, e }, (err) => {
        //             if (!err) {
        //                 successes += 1
        //                 this.logger.info(`progress: ${successes}/${Object.keys(this.chunks).length}`)
        //             }
        //         });
        //     }
        //     await q.drain();
        // }
        // async combineChunks(): Promise<void> {
        //     this.cleanGoal()
        //     for (const cf of Object.keys(this.chunks).map((id) => `${this.cacheDest}/${id}`)) {
        //         await mergeFile(cf, this.goalFile)
        //     }
        //     this.logger.info('combine chunks success.')
        // }
        // private cleanGoal() {
        //     fs.removeSync(`${this.goalFile}`)
        // }
        // private cleanCache() {
        //     fs.rmdirSync(`${this.cacheDest}`, { recursive: true })
        // }
        // public markSuccess(id: number) {
        //     this.chunks[id][2] = 1
        // }
        // private addLock() {
        //     fs.writeFileSync(`${this.cacheDest}/lock`, '', { encoding: 'utf8' })
        // }
        // private async checksha256() {
        //     const goalSha256 = await sha256sum(this.goalFile)
        //     this.logger.info(`sha256: ${goalSha256.substr(0, 12)} - ${this.sha256.substr(0, 12)}`)
        //     return (goalSha256) === this.sha256
        // }
        // async start(): Promise<void> {
        //     this.logger.info('start')
        //     this.initDirs()
        //     const goalBytes = await this.reqGoalSize()
        //     console.log(`size: ${goalBytes}`)
        //     this.logger.info(`size: ${goalBytes}`)
        //     this.computeChunks(goalBytes)
        //     this.logger.info(`chunks: ${Object.keys(this.chunks).length}`)
        //     await this.scheduleWorkers()
        //     await this.combineChunks()
        //     if (await this.checksha256()) {
        //         this.cleanCache()
        //     } else {
        //         await sleep(1000)
        //         this.logger.info(`retry.`)
        //         await this.start()
        //     }
        //     this.logger.info('success')
        // }
    }
    // constructor() {
    //     this.cacheDest = `${this.dest}/cache`
    //     this.goalFile = `${this.dest}/${name}`
    // }
    // static create(url: string, headers: ReqHeader, dest: string, name: string, goalName: string, sha256: string): DownManager {
    //     const l = logger.create('DownManager' + ' ' + name + ' ' + sha256.substr(0, 12))
    //     return new DownManager(url, headers, dest, goalName, sha256, l)
    // }
    DownManager.prototype.addTask = function (t) {
        // const tId: string = t.getId()
        for (var _i = 0, _a = this.taskQueue; _i < _a.length; _i++) {
            var tq = _a[_i];
            if (tq.getId() == t.getId()) {
                return;
            }
        }
        this.taskQueue.push(t);
    };
    DownManager.prototype.removeTask = function (t) {
        var index = this.taskQueue.map(function (t) { return t.getId(); }).indexOf(t.getId());
        if (index >= 0) {
            this.taskQueue.splice(index, 1);
        }
    };
    DownManager.prototype.perform = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, _i, _a, task;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _loop_1 = function (task) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (task.getId() in this_1.taskWorkers.workersList().map(function (w) { return w.data.task.getId(); })) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        this_1.taskWorkers.push({ task: task }, function (err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            _this.removeTask(task);
                                        });
                                        return [4 /*yield*/, helper_1.sleep(1000)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = this.taskQueue;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        task = _a[_i];
                        return [5 /*yield**/, _loop_1(task)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DownManager.prototype.wait = function (taskId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(taskId in this.taskQueue)) return [3 /*break*/, 2];
                        return [4 /*yield*/, helper_1.sleep(1000)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return DownManager;
}());
exports.DownManager = DownManager;
