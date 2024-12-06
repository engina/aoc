import fs from "fs";

const input = fs.readFileSync("25-input.txt", "utf-8");

class Connection {
  public static readonly all: Record<string, Connection> = {};
  public static create(a: Node, b: Node) {
    const key = [a.id, b.id].sort().join("-");
    if (!Connection.all[key]) {
      Connection.all[key] = new Connection(a, b);
    }
    return Connection.all[key];
  }

  private constructor(
    private readonly a: Node,
    private readonly b: Node,
    public cut: boolean = false
  ) {}

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

class Node {
  public static readonly all: Record<string, Node> = {};
  public static create(id: string, connections?: Set<Connection>) {
    if (Node.all[id] === undefined) {
      Node.all[id] = new Node(id, connections);
    }
    return Node.all[id];
  }

  private constructor(
    public readonly id: string,
    public readonly conns: Set<Connection> = new Set()
  ) {}
}

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
function walk<T>(
  node: Node,
  cb: (n: Node, payload?: T) => boolean = () => true,
  payload?: T,
  visited: Set<Node> = new Set()
) {
  if (visited.has(node)) {
    return visited;
  }

  visited.add(node);
  // console.log(
  //   node.id,
  //   node.next.map((n) => n.id)
  // );
  // union of all visited nodes
  node.conns.forEach(
    (conn) => conn.cut || walk(conn.other(node), cb, payload, visited)
  );
  return visited;
}

walk(Node.create("pcf"));
console.log(Object.keys(Connection.all).length, Object.keys(Node.all).length);

// console.log(
//   Object.values(nodes)
//     .map((n) => n.next.length)
//     .filter((n) => n < 5)
//     .sort()
//     .reverse()
// );
