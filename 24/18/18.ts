import assert from "assert";
import { bench, bfs, binarySearch, dijkstra, dijkstraPQ } from "../../lib";
import {
  Cell,
  DirectionsAll,
  DirectionsOrthogonal,
  Grid,
  Vector,
} from "../../lib/grid";

class MemByte {
  constructor(public char: string, public dropTime: number) {}
  toString() {
    return this.char;
  }
}

export function setup(input: string) {
  const coords = input
    .trim()
    .split("\n")
    .map((l) => l.split(",").map(Number)) as [number, number][];

  const data: MemByte[][] = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => new MemByte(".", Infinity))
  );
  const grid = new Grid(data) as Grid<MemByte>;
  return { grid, coords };
}

export type Input = ReturnType<typeof setup>;

export function part1({ grid, coords }: Input) {
  // grid.print();
  // console.log("part1");
  for (let i = 0; i < 1024; i++) {
    const coor = coords[i];
    grid.get(coor)!.value.char = "#";
  }
  // grid.print();
  const start = grid.get(0, 0)!;
  const target = grid.get(WIDTH - 1, HEIGHT - 1)!;
  const t = bfs(
    start,
    (c) => c.position.isEqual(target.position),
    (c) =>
      c
        .getNeighbors(DirectionsOrthogonal as any as Vector[])
        .filter((c) => c?.value.char === ".") as Cell<MemByte>[]
  );
  return t!.cost.toString();

  dijkstraPQ(
    start,
    grid.cells.filter((c) => c.value.char === "."),
    (a, b) => a.distance + 1, //Math.max(a.value.dropTime, b.value.dropTime),
    (c) =>
      c
        .getNeighbors(DirectionsOrthogonal as any as Vector[])
        .filter((c) => c?.value.char === ".") as Cell<MemByte>[]
  );
  return target.distance.toString();
  let u = target;
  let path: Cell<MemByte>[] = [];
  let max = 0;
  while (u) {
    path.push(u);
    max = Math.max(max, u.value.dropTime);
    u.value.char = u.value.char.bgCyan;
    u = u.prev!;
  }
  grid.print();
  console.log(target.toString(), target.distance);
  // grid.print();
  // console.log("part1", t);
  // return t!.cost.toString();
}

// console.log(part1(setup(input)));

export function part2({ grid, coords }: Input) {
  // return;
  // for (let i = 0; i < 1024; i++) {
  //   const coor = coords[i];
  //   grid.get(coor)!.value.char = "#";
  // }
  // const target = new Vector2(grid.width - 1, grid.height - 1);
  // bench(
  //   () => {
  //     console.log(
  //       bfs(
  //         grid.get(0, 0)!,
  //         (c) => c.position.isEqual(target),
  //         (c) =>
  //           c
  //             .getNeighbors()
  //             .filter((c) => c?.value.char === ".") as Cell<MemByte>[]
  //       )
  //     );
  //   },
  //   {
  //     setup: () => {
  //       grid.cells.forEach((c) => (c.explored = false));
  //     },
  //   }
  // );
  // return;
  // console.log("part2", coords.length);

  coords.forEach(([x, y], i) => {
    const cell = grid.get(x, y)!;
    cell.value.char = "#";
    cell.value.dropTime = i;
  });

  // grid.print();

  let startCandidates = grid.cells.filter(
    (c) =>
      (c.position.x === 0 ||
        (c.position.y === grid.height - 1 &&
          c.position.x !== grid.width - 1)) &&
      c.value.char === "#"
  );
  // .sort((a, b) => a.value.dropTime - b.value.dropTime);

  let endCandidates = grid.cells
    .filter(
      (c) =>
        ((c.position.x === grid.width - 1 && c.position.x > 0) ||
          c.position.y === 0) &&
        c.value.char === "#"
    )
    .sort((a, b) => a.value.dropTime - b.value.dropTime);

  if (startCandidates.length > endCandidates.length) {
    const tmp = startCandidates;
    startCandidates = endCandidates;
    endCandidates = tmp;
  }

  const corruptions = grid.cells.filter((c) => c.value.char === "#");

  // const ends = new Set(endCandidates);
  // let min = Infinity;
  // let minPath: Cell<MemByte>[] = [];
  // const t = bfs(
  //   startCandidates,
  //   (c) => {
  //     if (ends.has(c)) {
  //       let max = 0;
  //       let u = c;
  //       let path: Cell<MemByte>[] = [];
  //       while (u) {
  //         max = Math.max(max, u.value.dropTime);
  //         path.push(u);
  //         u = u.prev!;
  //       }
  //       console.log(
  //         max,
  //         path.map((c) => c.position.toString() + c.value.dropTime).join(",")
  //       );
  //       if (max < min) {
  //         min = max;
  //         minPath = path;
  //       }
  //     }
  //     return false;
  //   },
  //   (c) =>
  //     c
  //       .getNeighbors(DirectionsAll as any as Vector[])
  //       .filter((c) => c?.value.char === "#") as Cell<MemByte>[]
  // );
  // console.log(t, min, minPath.map((c) => c.position.toString()).join(","));
  // return;

  //////
  // grid.print();
  startCandidates.forEach((c) => (c.distance = c.value.dropTime));
  const end = dijkstraPQ(
    startCandidates,
    corruptions,
    (u, d) => {
      return Math.max(u.value.dropTime, d.value.dropTime);
    },
    (cell) =>
      cell
        .getNeighbors(DirectionsAll as any as Vector[])
        .filter((c) => c?.value.char === "#") as Cell<MemByte>[],
    new Set(endCandidates)
  );
  if (!end) {
    throw new Error("No solution");
  }
  // console.log("end", end.position.toString());
  end.value.char = end.value.char.bgRed;
  let u = end;
  let max = 0;

  grid.cells.forEach((c) => {
    if (c.explored) c.value.char = c.value.char.bgGreen;
  });

  while (u) {
    // console.log("walking", u.toString());
    u.value.char = u.value.char.bgGreen;
    max = Math.max(max, u.value.dropTime);
    u = u.prev!;
  }
  // grid.print();
  return coords[max].join(",");
}

let input = ``;

input = `5,4
4,2
4,5
3,0
2,1
6,3
2,4
1,5
0,6
3,3
2,6
5,1
1,2
5,5
2,5
6,5
1,4
0,4
6,4
1,1
6,1
1,0
0,5
1,6
2,0
`;

let WIDTH = 7;
let HEIGHT = 7;

// import fs from "fs";
// input = fs.readFileSync("input.txt", "utf-8");

WIDTH = 71;
HEIGHT = 71;
// console.log(part1(setup(input)));
// console.log(part2(setup(input)));
