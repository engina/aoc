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
var worker_threads_1 = require("worker_threads");
var os_1 = require("os");
// const input = fs.readFileSync("25-input.txt", "utf-8");
var input = "jqt: rhn xhk nvd\nrsh: frs pzl lsr\nxhk: hfx\ncmg: qnr nvd lhk bvb\nrhn: xhk bvb hfx\nbvb: xhk hfx\npzl: lsr hfx nvd\nqnr: nvd\nntq: jqt hfx bvb xhk\nnvd: lhk\nlsr: lhk\nrzs: qnr cmg lsr rsh\nfrs: qnr lhk lsr\n";
var Connection = /** @class */ (function () {
    function Connection(a, b, cut, key) {
        if (cut === void 0) { cut = false; }
        if (key === void 0) { key = ""; }
        this.a = a;
        this.b = b;
        this.cut = cut;
        this.key = key;
        a.conns.add(this);
        b.conns.add(this);
    }
    Connection.create = function (aid, bid) {
        var key = [aid, bid].sort().join("-");
        if (!Connection.all[key]) {
            // console.log("Creating connection", key);
            Connection.all[key] = new Connection(MNode.get(aid), MNode.get(bid), false, key);
        }
        // console.log("Returning connection", key);
        return Connection.all[key];
    };
    Connection.prototype.toString = function () {
        return this.key;
    };
    Connection.prototype.other = function (node) {
        if (node === this.a) {
            return this.b;
        }
        if (node === this.b) {
            return this.a;
        }
        throw new Error("Node not in connection");
    };
    Connection.prototype.isEqual = function (conn) {
        return ((conn.a === this.a && conn.b === this.b) ||
            (conn.a === this.b && conn.b === this.a));
    };
    Connection.all = {};
    return Connection;
}());
var MNode = /** @class */ (function () {
    function MNode(id) {
        this.id = id;
        this.conns = new Set();
    }
    MNode.get = function (id) {
        if (MNode.all[id] === undefined) {
            // console.log("Creating node", id);
            MNode.all[id] = new MNode(id);
        }
        // console.log("Returning node", id);
        return MNode.all[id];
    };
    MNode.all = {};
    return MNode;
}());
input
    .split("\n")
    .filter(function (i) { return !!i; })
    .forEach(function (line) {
    var _a = line.split(" "), _id = _a[0], nextIds = _a.slice(1);
    var id = _id.slice(0, 3);
    nextIds.forEach(function (nextId) {
        // console.log("Creating connection", id, nextId);
        Connection.create(id, nextId);
    });
});
// Connection.all["hfx-pzl"].cut = true;
// Connection.all["bvb-cmg"].cut = true;
// Connection.all["jqt-nvd"].cut = true;
// print node graph with circular structure handling
function walk(node, cb, payload, visited) {
    if (cb === void 0) { cb = function () { return true; }; }
    if (visited === void 0) { visited = new Set(); }
    if (visited.has(node)) {
        return 0;
    }
    visited.add(node);
    var sum = 1;
    node.conns.forEach(function (conn) {
        if (conn.cut)
            return;
        sum += walk(conn.other(node), cb, payload, visited);
    });
    return sum;
}
var connections = Object.values(Connection.all);
var result = [];
var totalNodes = Object.keys(MNode.all).length;
var workers = [];
if (worker_threads_1.isMainThread) {
    // get core count
    var coreCount = (0, os_1.cpus)().length;
    console.log("Core count", coreCount);
    var _loop_1 = function (i_1) {
        console.log("Creating worker", i_1);
        var w = new worker_threads_1.Worker("./25_v2.cjs", {
            workerData: { id: 1, conns: Connection.all, nodes: MNode.all },
        });
        w.on("message", function (msg) {
            console.log("Worker message", i_1, msg);
        });
        w.on("error", function (err) {
            console.error("Worker error", i_1, err);
        });
        workers.push(w);
    };
    // create workers
    for (var i_1 = 0; i_1 < coreCount; i_1++) {
        _loop_1(i_1);
    }
}
var i = 0;
function sendJob(a, b) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var worker = workers.pop();
                    if (!worker) {
                        setTimeout(function () {
                            sendJob(a, b).then(resolve).catch(reject);
                        }, 1000);
                    }
                    else {
                        console.log("Sending job to", worker.threadId);
                        worker.postMessage([a, b]);
                        worker.once("message", function (msg) {
                            resolve(msg);
                            workers.push(worker);
                        });
                    }
                })];
        });
    });
}
// console.log(parentPort);
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on("message", function (a, b) {
    console.log("Worker received message", a.toString(), b.toString());
    var _a = worker_threads_1.workerData, conns = _a.conns, id = _a.id, nodes = _a.nodes;
    a.cut = b.cut = true;
    var result = [];
    for (var _i = 0, _b = Object.values(conns); _i < _b.length; _i++) {
        var conn = _b[_i];
        conn.cut = true;
        var visited = walk(nodes["jqt"]);
        if (visited !== totalNodes) {
            var groupA = visited;
            var groupB = totalNodes - visited;
            var diff = Math.abs(groupA - groupB);
            if (diff < 10)
                result.push({
                    conn: [a, b],
                    groupA: groupA,
                    groupB: groupB,
                    diff: diff,
                });
        }
        conn.cut = false;
    }
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(result);
});
// console.log(log.sort().join("\n"));
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var i_2, a, j, b;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i_2 = 0;
                    _a.label = 1;
                case 1:
                    if (!(i_2 < connections.length)) return [3 /*break*/, 6];
                    console.log("Progress: ".concat(((i_2 * 100) / connections.length).toFixed(4)));
                    a = connections[i_2];
                    j = 0;
                    _a.label = 2;
                case 2:
                    if (!(j < connections.length)) return [3 /*break*/, 5];
                    if (i_2 === j)
                        return [3 /*break*/, 4];
                    b = connections[j];
                    return [4 /*yield*/, sendJob(a, b)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    j++;
                    return [3 /*break*/, 2];
                case 5:
                    i_2++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
main();
console.log(result
    .sort(function (a, b) { return a.diff - b.diff; })
    .slice(0, 10)
    .map(function (r) {
    return "".concat(r.conn.map(function (c) { return c.toString(); }).join(" "), " ").concat(r.groupA, " ").concat(r.groupB, " ").concat(r.diff);
})
    .join("\n"));
