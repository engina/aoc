import assert from "assert";
import { bench } from "../../lib";
import {
  Cell,
  CollisionType,
  Direction,
  Grid,
  gridWalk,
  Vector2,
} from "../../lib/grid";

let input = `
###############
#.......#....E#
#.#.###.#.###.#
#.....#.#...#.#
#.###.#####.#.#
#.#.#.......#.#
#.#.#####.###.#
#...........#.#
###.#.#####.#.#
#...#.....#.#.#
#.#.#.###.#.#.#
#.....#...#.#.#
#.###.#.#.#.#.#
#S..#.....#...#
###############
`;

input = `#################
#...#...#...#..E#
#.#.#.#.#.#.#.#.#
#.#.#.#...#...#.#
#.#.#.#.###.#.#.#
#...#.#.#.....#.#
#.#.#.#.#.#####.#
#.#...#.#.#.....#
#.#.#####.#.###.#
#.#.#.......#...#
#.#.###.#####.###
#.#.#...#.....#.#
#.#.#.#####.###.#
#.#.#.........#.#
#.#.#.#########.#
#S#.............#
#################
`;

export function setup(input: string) {
  return new Grid(
    input
      .trim()
      .split("\n")
      .map((l) => l.split(""))
  );
}

export type Input = ReturnType<typeof setup>;

export function part1(grid: Input) {
  grid.print();

  type WalkState = {
    best: number;
    paths: Cell<string>[][];
    visited: Set<Cell<string>>;
  };

  function gridWalk(cell: Cell<string>, direction: Direction) {
    const visited = new Set<Cell<string>>();
    if (visited.has(cell)) return;
    visited.add(cell);

    const paths: Cell<string>[][] = [];
    let currentBest = Infinity;

    function cost(path: Cell<string>[]) {
      let c = 0;
      for (const cell of path) {
        if (cell.value === ".") {
          c += 1;
        }
      }
    }

    const queue = [cell];

    while (queue.length) {
      const current = queue.shift()!;
      const neighbors = cell.getNeighbors();
    }
  }

  const start = grid.cells.find((c) => c.value === "S")!;
  // const bfs = BFS(start);
  // const cells: Cell<string>[] = [];
  // let cell = bfs;
  // while (cell) {
  //   cells.push(cell);
  //   cell = cell.parent;
  // }
  // cells.reverse();
  // console.log(cells.map((c) => c.toString()).join("->"));
  return start.walk({
    collision: (cell) => {
      if (cell.value === "#") return CollisionType.OBSTACLE;
      if (cell.value === "E") return CollisionType.GOAL;
      return CollisionType.NONE;
    },
    cost: (path, prevCost = 0) => {
      let c = prevCost;
      if (path.length < 2) return 0;

      // Get current direction
      // const thirdToLast = path[path.length - 3] ?? Directions.east;
      const secondToLast = path[path.length - 2];
      const last = path[path.length - 1];
      const dirCurr = [
        last.position.x - secondToLast.position.x,
        last.position.y - secondToLast.position.y,
      ];

      if (path.length === 2) {
        if (dirCurr[0] !== 1) {
          return 1001;
        }
        return 1;
      }

      const dirPrev = [
        secondToLast.position.x - path[path.length - 3].position.x,
        secondToLast.position.y - path[path.length - 3].position.y,
      ];
      // console.log({ dirCurr, dirPrev });
      // Get direction change
      const dx = dirCurr[0] - dirPrev[0];
      const dy = dirCurr[1] - dirPrev[1];
      if (dx !== 0 || dy !== 0) {
        c += 1000;
      }
      c += 1;
      return c;
    },
  });
}
import fs from "fs";
import { MinHeap } from "../../lib/min-heap";
input = fs.readFileSync("input.txt", "utf-8");
const grid = setup(input);
grid.print();
let junctions = grid.cells.filter(
  (c) =>
    c.value === "." &&
    c.getNeighbors().filter((c) => c?.value === ".").length > 2
);

// junctions.forEach((j) => (j.value = "+".green));

console.log("junctions.length", junctions.length);
let deadends = grid.cells.filter(
  (c) =>
    c.value === "." &&
    c.getNeighbors().filter((c) => c?.value === "#").length === 3
);
function prep() {
  junctions.forEach((j, i) => {
    j.value = "+".green;
    // const s = gridWalk(j, {
    //   collision: (c) => {
    //     if (j === c) return CollisionType.GOAL;
    //     if (c.value === "#") return CollisionType.OBSTACLE;
    //     if (c.value === "#".red) return CollisionType.OBSTACLE;
    //     if (c.value === "S") return CollisionType.OBSTACLE;
    //     return CollisionType.NONE;
    //   },
    // });
    // console.log("+ walk", s.paths);
    // if (s.paths.length > 1) {
    //   s.paths
    //     .sort((a, b) => a[1].length - b[1].length)
    //     .forEach(([cost, path], i) => {
    //       if (i === 0) return;
    //       path.forEach((p) => {
    //         p.value = "o";
    //       });
    //     });
    // }
  });
  console.log("---");
  grid.print();
  let deadPass = 0;
  while (deadends.length) {
    deadends.forEach((d) => {
      // console.log(`Marking deadend ${d.toString()}`);
      d.value = "#".red;
      const s = gridWalk(d, {
        collision: (c) => {
          if (c.value === "+".green) return CollisionType.GOAL;
          if (c.value === "S") return CollisionType.GOAL;
          if (c.value === "#") return CollisionType.OBSTACLE;
          if (c.value === "#".red) return CollisionType.OBSTACLE;
          // if (c.value === "S") return CollisionType.OBSTACLE;
          return CollisionType.NONE;
        },
      });
      if (s.paths.length !== 1) {
        console.log(d, s);
        throw new Error("Unexpected length");
      }
      // console.log(s.paths[0]);
      s.paths[0][1].forEach((c) => {
        // console.log("marking as x", c.toString());
        if (c.value === ".") c.value = "#".red;
      });
      // console.log("s", s);
    });
    // console.log("deadend pass", deadPass++);
    // grid.print();
    // console.log("remove forks");
    junctions.forEach((j) => (j.value = "."));
    // grid.print();
    junctions = grid.cells.filter(
      (c) =>
        c.value === "." &&
        c.getNeighbors().filter((c) => c?.value === ".").length > 2
    );
    deadends = grid.cells.filter(
      (c) =>
        c.value === "." &&
        c.getNeighbors().filter((c) => c?.value === "#" || c?.value === "#".red)
          .length === 3
    );
    // console.log(
    //   "remaining deadends",
    //   deadends.length,
    //   deadends.map((d) => d.toString()).join(", ")
    // );
    junctions = grid.cells.filter(
      (c) =>
        c.value === "." &&
        c.getNeighbors().filter((c) => c?.value === ".").length === 3
    );
    // console.log("putting forks back");

    junctions.forEach((j) => (j.value = "+".green));
    // grid.print();
  }
}
// bench(() => prep(), { runs: 1, label: "prep" });
grid.print();
console.log("junctions", junctions.length);

// console.log("deadends", deadends.length);
// grid.print();
// const result = bench(() => part1(grid), { runs: 1 }).results[0].result;
// // result.paths.flatMap((p) => p).forEach((c) => (c.updated = true));
// console.log({ ...result, visited: undefined, paths: undefined });
// const paths = result.paths.map((path) =>
//   path.map((p) => p.toString()).join(" -> ")
// );
// console.log(paths);
// grid.print();

// 298080 too high
// 296076 too high
// 294072 not correct

// 1  function Dijkstra(Graph, source):
// 2
// 3      for each vertex v in Graph.Vertices:
// 4          dist[v] ← INFINITY
// 5          prev[v] ← UNDEFINED
// 6          add v to Q
// 7      dist[source] ← 0
// 8
// 9      while Q is not empty:
// 10          u ← vertex in Q with minimum dist[u]
// 11          remove u from Q
// 12
// 13          for each neighbor v of u still in Q:
// 14              alt ← dist[u] + Graph.Edges(u, v)
// 15              if alt < dist[v]:
// 16                  dist[v] ← alt
// 17                  prev[v] ← u
// 18
// 19      return dist[], prev[]
const s = grid.find("S")!;
// assert(s);
// const [nw] = s.getNeighbors([Directions.west]);
// assert(nw);
// s.parent = nw;

// grid.cells.forEach((c) => {
//   if (c.value === "+".green) {
//     c.value = ".";
//   }
// });

const paths = grid.cells.filter(
  (c) => c.value !== "#" && c.value !== "S" && c.value !== "#".red
);

class SortedList<T> {
  constructor(public array: T[] = []) {
    array.sort();
  }

  swap(i: number, j: number) {
    const temp = this.array[i];
    this.array[i] = this.array[j];
    this.array[j] = temp;
  }

  updated(i: number) {
    const updated = this.array[i];
    const prev = this.array[i - 1];
    const next = this.array[i + 1];
    if (prev > updated) {
      for (let j = i - 1; j >= 0; j--) {
        if (this.array[j] < updated) {
          this.swap(j + 1, i);
        }
      }
    } else if (next < updated) {
      for (let j = i + 1; j < this.array.length; j++) {
        if (this.array[j] < updated) {
          this.array[j - 1] = this.array[j];
          this.array[j] = updated;
        }
      }
    }
  }
}

function dijkstra<T extends { prev: T | undefined; distance: number }>(
  start: T,
  all: T[],
  distance: (s: T, d: T) => number,
  edges: (s: T) => T[]
) {
  const minHeap = new MinHeap<T>((a, b) => a.distance - b.distance);
  minHeap.buildHeap([start, ...all]);
  const queue: T[] = [start, ...all];
  start.distance = 0;
  while (queue.length) {
    const u = queue.shift();
    if (!u) continue;

    const neighbors = edges(u); //u.getNeighbors().filter((n) => n?.value !== "#");

    for (const neighbor of neighbors) {
      if (!neighbor) continue;
      const ni = queue.indexOf(neighbor);
      if (ni === -1) continue;
      const d = distance(u, neighbor);
      if (d < neighbor.distance) {
        neighbor.distance = d;
        queue.sort((a, b) => a.distance - b.distance);
        neighbor.prev = u;
      }
    }
  }
}

function until(cell: string): boolean {
  if (cell === "E") return true;
  if (cell === "+".green) return true;
  if (cell === "#") return true;
  if (cell === "#".red) return false;
  return false;
}

const br = bench(
  (setup) => {
    dijkstra(
      s,
      paths,
      (u, b) => {
        const prevDir =
          u.prev !== undefined
            ? u.position.clone().sub(u.prev.position)
            : new Vector2(1, 0);
        const newDir = b.position.clone().sub(u.position);
        // console.log({ prevDir, newDir });
        let distance = u.distance + 1;
        if (!prevDir.isEqual(newDir)) {
          distance += 1000;
        }
        return distance;
      },
      (u) => {
        // const next: Cell<string>[] = [];
        // for (const dir of DirectionsOrthogonal) {
        //   const peek = u.peek2(dir as Vector, until);
        //   if (peek.length === 0) continue;
        //   const last = peek[peek.length - 1];
        //   if (last.value !== "+".green) continue;
        //   next.push(last);
        //   // console.log("peek", dir, peek.map((p) => p.toString()).join(", "));
        // }
        // console.log(next, next.map((n) => n.toString()).join(", "));
        // return next;
        // process.exit(0);
        return u
          .getNeighbors()
          .filter(
            (u) => u?.value === "." || u?.value === "E"
          ) as Cell<string>[];
      }
    );
    const dst = setup?.start.grid.find("E");
    return dst?.distance;
  },
  {
    runs: 1,
    setup: () => {
      const grid = setup(input);
      const start = grid.find("S");
      assert(start);
      const paths = grid.cells.filter((c) => c.value !== "#");
      return { start, paths };
    },
  }
);
console.log(br.results);
// grid.cells.forEach((c) =>
//   // console.log(c.parent?.toString(), " -> ", c.toString(), c.distance)
// );

// 1  S ← empty sequence
// 2  u ← target
// 3  if prev[u] is defined or u = source:          // Proceed if the vertex is reachable
// 4      while u is defined:                       // Construct the shortest path with a stack S
// 5          insert u at the beginning of S        // Push the vertex onto the stack
// 6          u ← prev[u]                           // Traverse from target to source

const S: Cell<string>[] = [];
let u = grid.find("E")!;
console.log(u.distance);
// assert(u.parent);
while (u) {
  u.value = u.value.bgGreen;
  S.unshift(u);
  u = u.prev!;
}
grid.print();
console.log(S.length);
// const cost = S.reduce((acc, curr) => (acc += curr.distance), 0);
// const path = S.map((s) => s.toString() + `[${s.distance}]`).join("->");
// console.log({ path });
// console.log({ cost });
