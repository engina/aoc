import { bench, bfs, dijkstraPQ } from "../../lib";
import { Cell, Grid, Vector } from "../../lib/grid";

let input = ``;

input = `###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############
`;

// import fs from "fs";
// input = fs.readFileSync("input.txt", "utf-8");

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
  const start = grid.find("S")!;
  const end = grid.find("E")!;
  grid.cells.forEach((c) => (c.distance = Infinity));
  start.distance = 0;

  const br = bfs(
    start,
    (c) => c === end,
    (n) => n.getNeighbors().filter((c) => c?.value !== "#") as Cell<string>[]
  );

  let u = br?.goal;
  let path: Cell<string>[] = [];
  while (u) {
    path.push(u);
    u.value = u.value.bgGreen;
    u = u.prev;
  }
  // grid.print();

  path.reverse();

  // abuse distance to store the index for fast look up below
  path.forEach((p, i) => (p.distance = i));

  const cheatVectors: Vector[] = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
  ];
  const ADVANTAGE_THRESHOLD = 100;
  let cheats = 0;
  const stat: Record<number, number> = {};
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const ch = p
      .getNeighbors(cheatVectors)
      .filter(Boolean)
      .filter((c) => c?.value !== "#") as Cell<string>[];
    if (ch.length === 0) continue;
    for (const c of ch) {
      const ci = c.distance; // fast lookup
      const advantage = ci - i - 2;
      if (advantage >= ADVANTAGE_THRESHOLD) {
        cheats++;
        if (stat[advantage]) {
          stat[advantage]++;
        } else {
          stat[advantage] = 1;
        }
      }
    }
  }

  return cheats.toString();
}

export function part2(grid: Input) {
  return "";
  const start = grid.find("S")!;
  const end = grid.find("E")!;

  grid.cells.forEach((c) => (c.distance = Infinity));
  start.distance = 0;

  const br = bfs(
    start,
    (c) => c === end,
    (n) => {
      const path: Cell<string>[] = [];
      let u: Cell<string> | undefined = n;

      const inCheat = n.value === "#";
      let hasBeenInCheat = false;
      while (u) {
        path.push(u);
        u = u.prev;
      }
    }
  );
}

console.log(part2(setup(input)));
