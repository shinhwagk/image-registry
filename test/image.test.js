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
var layer_1 = require("../src/image/layer");
var helper_1 = require("../src/helper");
var fs_extra_1 = require("fs-extra");
var constants_1 = require("../src/constants");
var sha256 = '70a4a9f9d194035612c9bcad53b10e24875091230d7ff5f172b425a89f659b95';
var owner = 'openshift';
var image = 'okd-content';
beforeAll(function () {
    fs_extra_1.mkdirpSync(constants_1.storageDir);
});
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, helper_1.sleep(5000)];
            case 1:
                _a.sent();
                fs_extra_1.removeSync(constants_1.storageDir);
                return [2 /*return*/];
        }
    });
}); });
describe('test image', function () {
    var pil = layer_1.ProxyLayer.create(owner, image, sha256);
    test('Check image', function () { return __awaiter(void 0, void 0, void 0, function () {
        var blobsShasum;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pil.verify()];
                case 1:
                    _a.sent();
                    console.log('verify');
                    return [4 /*yield*/, helper_1.sha256sum(constants_1.storageDir + "/quay.io/openshift/okd-content/" + sha256 + "/blobs")];
                case 2:
                    blobsShasum = _a.sent();
                    expect(blobsShasum).toBe(sha256);
                    return [2 /*return*/];
            }
        });
    }); }, 60 * 1000);
});
