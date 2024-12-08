export type ConnectionDict = Record<string, Connection>;
export type NodeDict = Record<string, Node>;

export class Connection {
  public static create(
    aid: string,
    bid: string,
    connDict: ConnectionDict,
    nodeDict: NodeDict
  ) {
    const key = [aid, bid].sort().join("-");
    if (!connDict[key]) {
      // console.log("Creating connection", key);
      connDict[key] = new Connection(
        Node.get(aid, nodeDict),
        Node.get(bid, nodeDict),
        false,
        key
      );
    }
    // console.log("Returning connection", key);
    return connDict[key];
  }

  private constructor(
    public readonly a: Node,
    public readonly b: Node,
    public cut: boolean = false,
    private readonly key = ""
  ) {
    a.conns.add(this);
    b.conns.add(this);
  }

  toString() {
    return this.key;
  }

  public other(node: Node) {
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

export class Node {
  public static get(id: string, dict: NodeDict) {
    if (dict[id] === undefined) {
      // console.log("Creating node", id);
      dict[id] = new Node(id);
    }
    // console.log("Returning node", id);
    return dict[id];
  }

  public network: string = "";
  public readonly conns: Set<Connection> = new Set();
  private constructor(public readonly id: string) {}
}

export function walk<T>(
  node: Node,
  cb: (n: Node, payload?: T) => boolean = () => true,
  payload?: T,
  visited: Set<Node> = new Set()
) {
  if (visited.has(node)) {
    return 0;
  }

  visited.add(node);
  // console.log(
  //   node.id,
  //   node.next.map((n) => n.id)
  // );
  // union of all visited nodes
  let sum = 1;
  node.conns.forEach((conn) => {
    if (conn.cut) {
      // console.log(`Not walking ${conn.toString()}`);
      return;
    }
    // console.log(`${node.id} -> ${conn.other(node).id}`);
    sum += walk(conn.other(node), cb, payload, visited);
  });
  return sum;
}

export function nodeConnDiff(a: Node, b: Node): number {
  // find the diff of a.conn and b.conn
  const diffA = new Set<Connection>();
  a.conns.forEach((conn) => {
    if (!b.conns.has(conn)) {
      diffA.add(conn);
    }
  });
  const diffB = new Set<Connection>();
  b.conns.forEach((conn) => {
    if (!a.conns.has(conn)) {
      diffB.add(conn);
    }
  });
  return diffA.size + diffB.size;
}
