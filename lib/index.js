"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bench = void 0;
exports.combinations = combinations;
exports.permutations = permutations;
exports.unique = unique;
function combinations(arr, N) {
    var indexes, result, i, j;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexes = Array.from({ length: N }, function (_, i) { return i; });
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                result = indexes.map(function (i) { return arr[i]; });
                return [4 /*yield*/, result];
            case 2:
                _a.sent();
                i = N - 1;
                while (i >= 0 && indexes[i] === arr.length - N + i) {
                    i--;
                }
                if (i < 0) {
                    return [3 /*break*/, 3];
                }
                indexes[i]++;
                for (j = i + 1; j < N; j++) {
                    indexes[j] = indexes[i] + j - i;
                }
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
// permutation generator
// can handle where arr.length < N
function permutations(arr, N) {
    var i, end, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                end = Math.pow(arr.length, N);
                _a.label = 1;
            case 1:
                if (!(i < end)) return [3 /*break*/, 3];
                result = Array.from({ length: N }, function (_, j) {
                    var index = Math.floor(i / Math.pow(arr.length, j)) % arr.length;
                    return arr[index];
                });
                return [4 /*yield*/, result];
            case 2:
                _a.sent();
                i++;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
// create a unique element from an array filter
function unique(arr) {
    return Array.from(new Set(arr));
}
var bench = function (fn, label, disabled) {
    if (disabled === void 0) { disabled = false; }
    if (disabled)
        return fn();
    var start = performance.now();
    var result = fn();
    var elapsed = performance.now() - start;
    console.log("[".concat(label !== null && label !== void 0 ? label : "Bench", "] took: ").concat(elapsed.toFixed(2), "ms"));
    return result;
};
exports.bench = bench;
