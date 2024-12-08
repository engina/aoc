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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var input = fs_1.default.readFileSync("25-input.txt", "utf-8");
// const input = `jqt: rhn xhk nvd
// rsh: frs pzl lsr
// xhk: hfx
// cmg: qnr nvd lhk bvb
// rhn: xhk bvb hfx
// bvb: xhk hfx
// pzl: lsr hfx nvd
// qnr: nvd
// ntq: jqt hfx bvb xhk
// nvd: lhk
// lsr: lhk
// rzs: qnr cmg lsr rsh
// frs: qnr lhk lsr
// `;
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
            console.log("Creating connection", key);
            Connection.all[key] = new Connection(MNode.get(aid), MNode.get(bid), false, key);
        }
        console.log("Returning connection", key);
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
    // console.log(
    //   node.id,
    //   node.next.map((n) => n.id)
    // );
    // union of all visited nodes
    var sum = 1;
    node.conns.forEach(function (conn) {
        if (conn.cut) {
            // console.log(`Not walking ${conn.toString()}`);
            return;
        }
        // console.log(`${node.id} -> ${conn.other(node).id}`);
        sum += walk(conn.other(node), cb, payload, visited);
    });
    return sum;
}
/* a1 -\          /- d1
 * a2 -> b1 -> c1 <- d2
 * a3 -/          \- d3 -|
 * a4 -\          /- d4 -|
 * a5 -> b2 -> c2 <- d5
 * a6 -/          \- d6 -|
 * a7 -\          /- d7 -|
 * a8 -> b3 -> c3 <- d8
 * a9 -/          \- d9
 */
// Connection.create("a1", "b1");
// Connection.create("a2", "b1");
// Connection.create("a3", "b1");
// Connection.create("a4", "b2");
// Connection.create("a5", "b2");
// Connection.create("a6", "b2");
// Connection.create("a7", "b3");
// Connection.create("a8", "b3");
// Connection.create("a9", "b3");
// Connection.create("b1", "c1");
// Connection.create("b2", "c2");
// Connection.create("b3", "c3");
// Connection.create("c1", "d1");
// Connection.create("c1", "d2");
// Connection.create("c1", "d3");
// Connection.create("c2", "d4");
// Connection.create("c2", "d5");
// Connection.create("c2", "d6");
// Connection.create("c3", "d7");
// Connection.create("c3", "d8");
// Connection.create("c3", "d9");
// Connection.create("d3", "d4");
// Connection.create("d6", "d7");
// const visited = walk(MNode.get("jqt"));
// const visited = walk(MNode.get("a1"));
// console.log(visited, Object.keys(MNode.all).length);
// console.log(Object.keys(Connection.all).length, Object.keys(MNode.all).length);
// process.exit(0);
var connections = Object.values(Connection.all);
// console.log(connections);
var result = [];
// create all possible combinations of 3 connections
function combinations(arr, n) {
    function helper(start, depth) {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(depth === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, result.slice()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    i = start;
                    _a.label = 3;
                case 3:
                    if (!(i <= arr.length - depth)) return [3 /*break*/, 6];
                    result[result.length - depth] = arr[i];
                    return [5 /*yield**/, __values(helper(i + 1, depth - 1))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    }
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                result = [];
                return [5 /*yield**/, __values(helper(0, n))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
// console.log("Computing combinations for", connections.length);
// const combGen = combinations(connections, 3);
// let count = 0;
// for (const comb of combGen) {
//   count++;
//   // Process each combination here
// }
// process.exit(0);
var totalNodes = Object.keys(MNode.all).length;
var log = [];
for (var i = 0; i < connections.length; i++) {
    console.log("Progress: ".concat(((i * 100) / connections.length).toFixed(4)));
    var a = connections[i];
    // console.log("Trying cutting", a.toString());
    for (var j = 0; j < connections.length; j++) {
        if (i === j)
            continue;
        var b = connections[j];
        // console.log("         ", b.toString());
        for (var k = 0; k < connections.length; k++) {
            if (j === k || i === k)
                continue;
            var c = connections[k];
            // console.log("                  ", c.toString());
            // if (i === j || j === k || i === k) continue;
            // console.log(i, j, k);
            // if (a.isEqual(b) || a.isEqual(c) || b.isEqual(c)) continue;
            var consStr = [a, b, c].map(function (conn) { return conn.toString(); }).join(" ");
            // log.push(`Trying cutting ${consStr}`);
            // console.log(`Trying cutting ${consStr}`);
            a.cut = b.cut = c.cut = true;
            var visited = walk(MNode.get("jqt"));
            if (visited !== totalNodes) {
                // console.log(
                //   "Found it",
                //   a.toString(),
                //   b.toString(),
                //   c.toString(),
                //   visited
                // );
                // console.log(visited, totalNodes);
                var groupA = visited;
                var groupB = totalNodes - visited;
                var diff = Math.abs(groupA - groupB);
                if (diff < 10)
                    result.push({
                        conn: [a, b, c],
                        groupA: groupA,
                        groupB: groupB,
                        diff: diff,
                    });
            }
            else {
                // console.log("Nope", a.toString(), b.toString(), c.toString());
            }
            a.cut = b.cut = c.cut = false;
        }
    }
}
// console.log(log.sort().join("\n"));
console.log(result
    .sort(function (a, b) { return a.diff - b.diff; })
    .slice(0, 10)
    .map(function (r) {
    return "".concat(r.conn.map(function (c) { return c.toString(); }).join(" "), " ").concat(r.groupA, " ").concat(r.groupB, " ").concat(r.diff);
})
    .join("\n"));
