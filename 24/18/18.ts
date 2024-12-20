import { bfs, dijkstraPQ } from "../../lib";
import {
  Cell,
  DirectionsAll,
  DirectionsOrthogonal,
  Grid,
  Vector,
} from "../../lib/grid";

let WIDTH = 71;
let HEIGHT = 71;

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
  for (let i = 0; i < 1024; i++) {
    const coor = coords[i];
    grid.get(coor)!.value.char = "#";
  }
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
}

/* The idea here is that we lay down all obstacles at first.
 *
 * Then we need to find a path of obstacles that connects any obstacles from
 * the West/South edges to North/East edges. Since we are located at top left
 * and want to access to bottom right, any of these this obstacle paths
 * would stop us from getting to the goal.
 *
 * Then each obstacle's drop time is the obstacle's "distance" (in terms of
 * Dijkstra). So we try to find the shortest path (with lowest drop times).
 *
 * For this to work, we calculate node distances with the highest drop time
 * in the path leading to it.
 */
export function part2({ grid, coords }: Input) {
  coords.forEach(([x, y], i) => {
    const cell = grid.get(x, y)!;
    cell.value.char = "#";
    cell.value.dropTime = i;
  });

  // west and south borders
  let startCandidates = grid.cells.filter(
    (c) =>
      (c.position.x === 0 ||
        (c.position.y === grid.height - 1 &&
          c.position.x !== grid.width - 1)) &&
      c.value.char === "#"
  );

  // north and east borders
  let endCandidates = grid.cells
    .filter(
      (c) =>
        ((c.position.x === grid.width - 1 && c.position.x > 0) ||
          c.position.y === 0) &&
        c.value.char === "#"
    )
    .sort((a, b) => a.value.dropTime - b.value.dropTime);

  // swap start and end candidates to actually start from lowest possibilities
  if (startCandidates.length > endCandidates.length) {
    const tmp = startCandidates;
    startCandidates = endCandidates;
    endCandidates = tmp;
  }

  const corruptions = grid.cells.filter((c) => c.value.char === "#");

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
  console.log(coords[end.distance]);

  let u = end;
  let max = 0;

  while (u) {
    max = Math.max(max, u.value.dropTime);
    u = u.prev!;
  }

  return coords[max].join(",");
}
