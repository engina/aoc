import * as fs from "fs";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { cpus } from "os";

// const input = fs.readFileSync("25-input.txt", "utf-8");
const input = `jqt: rhn xhk nvd
rsh: frs pzl lsr
xhk: hfx
cmg: qnr nvd lhk bvb
rhn: xhk bvb hfx
bvb: xhk hfx
pzl: lsr hfx nvd
qnr: nvd
ntq: jqt hfx bvb xhk
nvd: lhk
lsr: lhk
rzs: qnr cmg lsr rsh
frs: qnr lhk lsr
`;

class Connection {
  public static readonly all: Record<string, Connection> = {};
  public static create(aid: string, bid: string) {
    const key = [aid, bid].sort().join("-");
    if (!Connection.all[key]) {
      // console.log("Creating connection", key);
      Connection.all[key] = new Connection(
        MNode.get(aid),
        MNode.get(bid),
        false,
        key
      );
    }
    // console.log("Returning connection", key);
    return Connection.all[key];
  }

  private constructor(
    private readonly a: MNode,
    private readonly b: MNode,
    public cut: boolean = false,
    private readonly key = ""
  ) {
    a.conns.add(this);
    b.conns.add(this);
  }

  toString() {
    return this.key;
  }

  public other(node: MNode) {
    if (node === this.a) {
      return this.b;
    }
    if (node === this.b) {
      return this.a;
    }
    throw new Error("Node not in connection");
  }

  public isEqual(conn: Connection) {
    return (
      (conn.a === this.a && conn.b === this.b) ||
      (conn.a === this.b && conn.b === this.a)
    );
  }
}

class MNode {
  public static readonly all: Record<string, MNode> = {};
  public static get(id: string) {
    if (MNode.all[id] === undefined) {
      // console.log("Creating node", id);
      MNode.all[id] = new MNode(id);
    }
    // console.log("Returning node", id);
    return MNode.all[id];
  }

  public readonly conns: Set<Connection> = new Set();
  private constructor(public readonly id: string) {}
}

input
  .split("\n")
  .filter((i) => !!i)
  .forEach((line) => {
    const [_id, ...nextIds] = line.split(" ");
    let id = _id.slice(0, 3);

    nextIds.forEach((nextId) => {
      // console.log("Creating connection", id, nextId);
      Connection.create(id, nextId);
    });
  });

// Connection.all["hfx-pzl"].cut = true;
// Connection.all["bvb-cmg"].cut = true;
// Connection.all["jqt-nvd"].cut = true;

// print node graph with circular structure handling
function walk<T>(
  node: MNode,
  cb: (n: MNode, payload?: T) => boolean = () => true,
  payload?: T,
  visited: Set<MNode> = new Set()
) {
  if (visited.has(node)) {
    return 0;
  }
  visited.add(node);
  let sum = 1;
  node.conns.forEach((conn) => {
    if (conn.cut) return;
    sum += walk(conn.other(node), cb, payload, visited);
  });
  return sum;
}

const connections = Object.values(Connection.all);

let result: {
  conn: Connection[];
  groupA: number;
  groupB: number;
  diff: number;
}[] = [];

const totalNodes = Object.keys(MNode.all).length;

const workers: Worker[] = [];
if (isMainThread) {
  // get core count
  const coreCount = cpus().length;
  console.log("Core count", coreCount);
  // create workers
  for (let i = 0; i < coreCount; i++) {
    console.log("Creating worker", i);
    const w = new Worker("./25_v2.cjs", {
      workerData: { id: 1, conns: Connection.all, nodes: MNode.all },
    });
    w.on("message", (msg) => {
      console.log("Worker message", i, msg);
    });
    w.on("error", (err) => {
      console.error("Worker error", i, err);
    });
    workers.push(w);
  }
}

let i = 0;
async function sendJob(a: Connection, b: Connection) {
  return new Promise((resolve, reject) => {
    const worker = workers.pop();
    if (!worker) {
      setTimeout(() => {
        sendJob(a, b).then(resolve).catch(reject);
      }, 1000);
    } else {
      console.log("Sending job to", worker.threadId);
      worker.postMessage([a, b]);
      worker.once("message", (msg) => {
        resolve(msg);
        workers.push(worker);
      });
    }
  });
}
// console.log(parentPort);
parentPort?.on("message", (a: Connection, b: Connection) => {
  console.log("Worker received message", a.toString(), b.toString());
  const { conns, id, nodes } = workerData as {
    id: number;
    conns: Record<string, Connection>;
    nodes: Record<string, MNode>;
  };
  a.cut = b.cut = true;
  const result: {
    conn: Connection[];
    groupA: number;
    groupB: number;
    diff: number;
  }[] = [];
  for (const conn of Object.values(conns)) {
    conn.cut = true;
    const visited = walk(nodes["jqt"]);
    if (visited !== totalNodes) {
      const groupA = visited;
      const groupB = totalNodes - visited;
      const diff = Math.abs(groupA - groupB);
      if (diff < 10)
        result.push({
          conn: [a, b],
          groupA,
          groupB,
          diff,
        });
    }
    conn.cut = false;
  }
  parentPort?.postMessage(result);
});

// console.log(log.sort().join("\n"));
async function main() {
  for (let i = 0; i < connections.length; i++) {
    console.log(`Progress: ${((i * 100) / connections.length).toFixed(4)}`);
    const a = connections[i];
    for (let j = 0; j < connections.length; j++) {
      if (i === j) continue;
      const b = connections[j];
      await sendJob(a, b);
    }
  }
}
main();
console.log(
  result
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 10)
    .map(
      (r) =>
        `${r.conn.map((c) => c.toString()).join(" ")} ${r.groupA} ${r.groupB} ${
          r.diff
        }`
    )
    .join("\n")
);
