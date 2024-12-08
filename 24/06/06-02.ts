import fs from "fs";

// const input = fs.readFileSync("input.txt", "utf8");

const input = `....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...
`;

type Vector2 = [number, number];
type Direction = "^" | "v" | "<" | ">";
type GuardVector = { pos: Vector2; dir: Direction };
type Grid = string[][];

const gridInit: Grid = input
  .split("\n")
  .filter(Boolean)
  .map((l) => l.split(""));

const grid = structuredClone(gridInit);

function guardGetVector(grid: Grid): GuardVector {
  // guard characters are '^', 'v', '<', '>'
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const dir = grid[y][x];
      if (dir === "^" || dir === "v" || dir === "<" || dir === ">") {
        return { pos: [x, y], dir };
      }
    }
  }
  throw Error("No guard found");
}

function gridGetLingOfSight(grid: Grid, guardVector: GuardVector): string[] {
  const [x, y] = guardVector.pos;
  const dir = guardVector.dir;
  const result: string[] = [];
  let x2 = x;
  let y2 = y;
  while (true) {
    switch (dir) {
      case "^":
        y2--;
        break;
      case "v":
        y2++;
        break;
      case "<":
        x2--;
        break;
      case ">":
        x2++;
        break;
    }
    if (y2 < 0 || y2 >= grid.length || x2 < 0 || x2 >= grid[y2].length) {
      break;
    }
    if (grid[y2][x2] === "#") {
      break;
    }
    result.push(grid[y2][x2]);
  }
  return result;
}

function guardRotateRight(grid: Grid, guard: GuardVector) : GuardVector{
  const [x, y] = guard.pos;
  const ret = structuredClone(guard);
  switch (guard.dir) {
    case "^":
      grid[y][x] = ">";
      ret.dir = ">";
      break;
    case "v":
      grid[y][x] = "<";
      ret.dir = "<";
      break;
    case "<":
      grid[y][x] = "^";
      ret.dir = "^";
      break;
    case ">":
      grid[y][x] = "v";
      ret.dir = "v";
      break;
  }
  return ret;
}

enum GuardMoveResult {
  OUT = 0x01,
  HIT = 0x02,
  LOOP = 0x04,
}

function guardMove(grid: Grid): GuardMoveResult {
  const guard = guardGetVector(grid);
  const dirChar = guard.dir === "^" || guard.dir === "v" ? "|" : "-";
  const lineOfSight = gridGetLingOfSight(grid, guard);
  console.log({ guard, lineOfSight, dirChar });
  const allVisited = lineOfSight.every((cell) => cell === dirChar);
  if (lineOfSight.length > 0 && allVisited) {
    console.log("LOOP DETECTED");
    printGrid(grid);
    console.log({ lineOfSight });
    return GuardMoveResult.LOOP;
  }
  const steps = lineOfSight.length + 1;
  grid[guard.pos[1]][guard.pos[0]] = dirChar;
  // console.log({ guard, steps });
  for (let i = 0; i < steps; i++) {
    const [x, y] = guard.pos;
    let x2 = x;
    let y2 = y;
    switch (guard.dir) {
      case "^":
        y2--;
        break;
      case "v":
        y2++;
        break;
      case "<":
        x2--;
        break;
      case ">":
        x2++;
        break;
    }
    if (y2 < 0 || y2 >= grid.length || x2 < 0 || x2 >= grid[y2].length) {
      return GuardMoveResult.OUT;
    }

    if (grid[y2][x2] === "#") {
      guardRotateRight(grid, guard);
      return GuardMoveResult.HIT;
    }
    grid[y2][x2] = dirChar;
    guard.pos = [x2, y2];
  }
  throw Error("Guard did not hit anything");
}

function printGrid(grid: Grid) {
  console.log("Grid:");
  for (const row of grid) {
    console.log(row.join(""));
  }
}

const guardInitialPos = guardGetVector(grid);

while (guardMove(grid) !== GuardMoveResult.OUT) {}

function gridCountCovered(grid: Grid): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell === "X") {
        count++;
      }
    }
  }
  return count;
}

function gridNewObstacleProspects(grid: Grid): Vector2[] {
  const result: Vector2[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "|" || grid[y][x] === "-") {
        result.push([x, y]);
      }
    }
  }
  return result;
}

console.log("first run");

printGrid(grid);
console.log(gridCountCovered(grid));

const prospects = gridNewObstacleProspects(grid).filter(
  ([x, y]) => !(x === guardInitialPos.pos[0] && y === guardInitialPos.pos[1])
);

console.log("prospects", prospects.length, prospects);

import readline from "readline";
function waitForKeyPress() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Press Enter to continue...", () => {
      rl.close();
      resolve(null);
    });
  });
}

const loopObstacle: Vector2[] = [];
[[3, 6]].forEach(async ([x, y]) => {
  const newGrid = structuredClone(gridInit);
  console.log("Placing obstacle at", x, y);
  newGrid[y][x] = "#";

  // while (
  //   (guardMove(newGrid) & (GuardMoveResult.OUT | GuardMoveResult.LOOP)) ===
  //   0
  // ) {}
  let result: GuardMoveResult;
  do {
    // block until a key press, then continue so that we can see iterations
    await waitForKeyPress();
    result = guardMove(newGrid);
    printGrid(newGrid);
  } while (result !== GuardMoveResult.LOOP && result !== GuardMoveResult.OUT);

  if (result === GuardMoveResult.LOOP) {
    loopObstacle.push([x, y]);
  }
  console.log("result");
});

console.log("loopObstacle", JSON.stringify(loopObstacle, null, 2));
console.log("loopObstacle", loopObstacle.length);
// 2634
