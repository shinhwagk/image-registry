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
exports.DownTask = void 0;
var path = require("path");
var fs = require("fs-extra");
var got_1 = require("got");
var async = require("async");
// import { Logger } from 'winston'
var helper_1 = require("../helper");
var constants_1 = require("../constants");
var DownTask = /** @class */ (function () {
    function DownTask(url, dest, name, sha256, auth) {
        this.url = url;
        this.dest = dest;
        this.name = name;
        this.sha256 = sha256;
        this.auth = auth;
        this.blobsBytes = 0;
        this.chunks = {};
        this.cacheDest = this.getCacheDest();
        this.blobsFile = path.join(dest, 'blobs');
    }
    DownTask.prototype.getId = function () {
        return this.name + '@' + this.sha256.substr(0, 12);
    };
    DownTask.prototype.getCacheDest = function () {
        return path.join(this.dest, 'cache');
    };
    DownTask.prototype.reqBlobsSize = function (t) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = {};
                        if (t.auth) {
                            headers['authorization'] = t.auth;
                        }
                        return [4 /*yield*/, got_1["default"].head(t.url, { headers: headers })];
                    case 1:
                        res = (_a.sent());
                        this.blobsBytes = Number(res.headers['content-length']);
                        return [2 /*return*/];
                }
            });
        });
    };
    DownTask.prototype.makeChunks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chunksNumber, i, r_start, r_end;
            return __generator(this, function (_a) {
                chunksNumber = (this.blobsBytes / constants_1.chunkSize >> 0) + 1;
                for (i = 0; i < chunksNumber; i++) {
                    r_start = i * constants_1.chunkSize;
                    if (chunksNumber - 1 === i) {
                        this.chunks[i] = [r_start, this.blobsBytes - 1, 0];
                        continue;
                    }
                    r_end = r_start + constants_1.chunkSize - 1;
                    this.chunks[i] = [r_start, r_end, 0];
                }
                return [2 /*return*/];
            });
        });
    };
    DownTask.prototype.cleanBlobs = function () {
        fs.removeSync(this.blobsFile);
    };
    DownTask.prototype.combineChunks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, cf;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.cleanBlobs();
                        _i = 0, _a = Object.keys(this.chunks).map(function (id) { return _this.cacheDest + "/" + id; });
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        cf = _a[_i];
                        return [4 /*yield*/, helper_1.mergeFile(cf, this.blobsFile)];
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
    // setState() {
    //     this.start =''
    // }
    DownTask.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chunkWorkers, _i, _a, _b, id, _c, start, end;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.makeChunks();
                        chunkWorkers = makeChunkWorkers();
                        for (_i = 0, _a = Object.entries(this.chunks); _i < _a.length; _i++) {
                            _b = _a[_i], id = _b[0], _c = _b[1], start = _c[0], end = _c[1];
                            chunkWorkers.push({ id: id, url: this.url, auth: this.auth, dest: this.cacheDest, r_start: start, r_end: end });
                        }
                        return [4 /*yield*/, chunkWorkers.drain()];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, this.combineChunks()];
                    case 2:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DownTask;
}());
exports.DownTask = DownTask;
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
