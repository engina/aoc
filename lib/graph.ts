export class ConnectionFactory {
  public readonly all: Record<string, Connection> = {};
  public create(aid: string, bid: string, nodeFactory: NodeFactory) {
    const key = [aid, bid].sort().join("-");
    if (!this.all[key]) {
      this.all[key] = new Connection(
        nodeFactory.get(aid),
        nodeFactory.get(bid),
        false,
        key
      );
    }
    return this.all[key];
  }
}

export class Connection {
  public constructor(
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

  public has(node: Node) {
    return this.a === node || this.b === node;
  }

  public isEqual(conn: Connection) {
    return (
      (conn.a === this.a && conn.b === this.b) ||
      (conn.a === this.b && conn.b === this.a)
    );
  }
}

export class Node {
  public network: string = "";
  public readonly conns: Set<Connection> = new Set();
  public constructor(public readonly id: string) {}
  public connectedNodes(includeSelf = false) {
    const connected = Array.from(this.conns).map((conn) => conn.other(this));
    if (includeSelf) {
      connected.push(this);
    }
    return connected;
  }
}

export class NodeFactory {
  public readonly all: Record<string, Node> = {};
  public get(id: string) {
    if (this.all[id] === undefined) {
      this.all[id] = new Node(id);
    }
    return this.all[id];
  }
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
  cb(node, payload);
  visited.add(node);
  let sum = 1;
  node.conns.forEach((conn) => {
    if (conn.cut) {
      return;
    }
    sum += walk(conn.other(node), cb, payload, visited);
  });
  return sum;
}
