import { combinations } from "../../lib";
import { ConnectionFactory, Node, NodeFactory } from "../../lib/graph";

export function setup(input: string) {
  const codes = input
    .trim()
    .split("\n")
    .map((line) => line.split("-"));

  const cf = new ConnectionFactory();
  const nf = new NodeFactory();

  for (const [p1, p2] of codes) {
    cf.create(p1, p2, nf);
  }

  return {
    cf,
    nf,
    codes,
  };
}

export type Input = ReturnType<typeof setup>;

export function part1({ nf }: Input) {
  const set = new Set<string>();
  Object.values(nf.all)
    .filter((n) => n.id[0] === "t")
    .forEach((n, i) => {
      const conns = Array.from(n.conns);
      const allInvolvedNodes = new Set<Node>();
      for (const conn of conns) {
        allInvolvedNodes.add(conn.a);
        allInvolvedNodes.add(conn.b);
      }
      allInvolvedNodes.delete(n);

      for (const [a, b] of combinations(Array.from(allInvolvedNodes), 2)) {
        a.conns.forEach((conn) => {
          if (conn.other(a) === b) {
            const netz = [a.id, b.id, n.id];
            set.add(netz.sort().join("-"));
          }
        });
      }
    });

  return set.size.toString();
}

export function part2({ nf }: Input) {
  const all = Object.values(nf.all);
  for (const n of all) {
    const connected = n
      .connectedNodes(true)
      .sort((a, b) => a.id.localeCompare(b.id));

    const networks: string[][] = [];
    for (const node of connected) {
      const net = node
        .connectedNodes(true)
        .map((n) => n.id)
        .sort();
      networks.push(net);
    }
    const uniqueNodes = new Set<string>();
    networks.forEach((net) => {
      net.forEach((n) => uniqueNodes.add(n));
    });
    const stat: Record<string, number> = {};
    for (const u of uniqueNodes) {
      networks.forEach((net) => {
        if (net.includes(u)) {
          stat[u] = (stat[u] ?? 0) + 1;
        }
      });
    }
    const self = stat[n.id];
    const others = Object.entries(stat).filter(([k, v]) => v === self - 1);

    if (others.length === self - 2) {
      return [n.id, ...others.map((o) => o[0])].sort().join(",");
    }
  }

  return "0";
}
