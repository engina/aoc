"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const input = fs_1.default.readFileSync("25-input.txt", "utf-8");
class Connection {
    static create(a, b) {
        const key = [a.id, b.id].sort().join("-");
        if (!Connection.all[key]) {
            Connection.all[key] = new Connection(a, b);
        }
        return Connection.all[key];
    }
    constructor(a, b, cut = false) {
        this.a = a;
        this.b = b;
        this.cut = cut;
    }
    other(node) {
        if (node === this.a) {
            return this.b;
        }
        if (node === this.b) {
            return this.a;
        }
        throw new Error("Node not in connection");
    }
    isEqual(conn) {
        return ((conn.a === this.a && conn.b === this.b) ||
            (conn.a === this.b && conn.b === this.a));
    }
}
Connection.all = {};
class Node {
    static create(id, connections) {
        if (Node.all[id] === undefined) {
            Node.all[id] = new Node(id, connections);
        }
        return Node.all[id];
    }
    constructor(id, conns = new Set()) {
        this.id = id;
        this.conns = conns;
    }
}
Node.all = {};
input
    .split("\n")
    .filter((i) => !!i)
    .map((line) => {
    const [_id, ...nextIds] = line.split(" ");
    let id = _id.slice(0, 3);
    const node = Node.create(id);
    nextIds.forEach((nextId) => {
        const nextNode = Node.create(nextId);
        const newConn = Connection.create(node, nextNode);
        node.conns.add(newConn);
        nextNode.conns.add(newConn);
    });
});
// print node graph with circular structure handling
function walk(node, visited = new Set()) {
    console.log(`Walking ${node.id}`);
    if (visited.has(node)) {
        return visited;
    }
    visited.add(node);
    // console.log(
    //   node.id,
    //   node.next.map((n) => n.id)
    // );
    // union of all visited nodes
    node.conns.forEach((n) => walk(n.other(node), visited));
    return visited;
}
walk(Node.create["pcf"]);
console.log(Object.keys(Connection.all).length, Object.keys(Node.all).length);
// console.log(
//   Object.values(nodes)
//     .map((n) => n.next.length)
//     .filter((n) => n < 5)
//     .sort()
//     .reverse()
// );
