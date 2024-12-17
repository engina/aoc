import "colors";

import { Cell, Direction, Directions, Grid, Vector } from "../../lib/grid";
import { parseGrid } from "../../lib/parse";

type CellType1 = "#" | "O" | "@" | ".";
type CellType2 = "#" | "[" | "]" | "@" | ".";

export function setup(input: string, part: 1 | 2) {
  const [map, movesStr] = input.trim().split("\n\n");
  const moves = movesStr
    .trim()
    .split("\n")
    .map((l) => l.split(""))
    .flatMap((l) => l)
    .map((m) => {
      switch (m) {
        case "^":
          return Directions.north;
        case "v":
          return Directions.south;
        case "<":
          return Directions.west;
        case ">":
          return Directions.east;
        default:
          throw new Error(`Unknown move: ${m}`);
      }
    });
  const grid = parseGrid(map) as Grid<"#" | "O" | "@" | ".">;
  if (part === 1) return { grid, moves };

  if (part === 2) {
    const grid2 = new Grid<CellType2>(
      grid.data.map((line) => {
        const l: CellType2[] = [];
        for (const c of line) {
          if (c === "#") {
            l.push("#", "#");
          } else if (c === ".") {
            l.push(".", ".");
          } else if (c === "O") {
            l.push("[", "]");
          } else if (c === "@") {
            l.push("@", ".");
          }
        }
        return l;
      })
    );
    return { grid: grid2, moves };
  }
  throw new Error("Unknown part");
}

export type Input = ReturnType<typeof setup>;

export function part1(input: Input) {
  const grid = input.grid as Grid<CellType1>;
  const moves = input.moves;
  const robot = grid.cells.find((c) => c.value === "@");
  if (!robot) {
    throw new Error("Robot not found");
  }

  for (const move of moves) {
    const ahead = robot.peek(move as Vector, "#");
    const next = ahead[0];
    if (next.value === "#") {
      continue;
    }

    if (next.value === ".") {
      grid.swap(robot, next);
      continue;
    }

    if (next.value === "O") {
      const gap = ahead.findIndex((a) => a.value === ".");
      if (gap === -1) {
        continue;
      }
      const gapCell = ahead[gap];
      for (let i = gap - 1; i >= 0; i--) {
        grid.swap(ahead[i], gapCell);
      }
      grid.swap(robot, gapCell);
    }
  }
  // grid.print();
  const sum = grid.cells
    .filter((c) => c.value === "O")
    .map((c) => c.position.y * 100 + c.position.x)
    .sort()
    .reduce((acc, c) => acc + c, 0)
    .toString();
  return sum.toString();
}

export function part2(input: Input) {
  const grid = input.grid as Grid<CellType2>;
  const moves = input.moves;
  const robot = grid.cells.find((c) => c.value === "@");
  if (!robot) {
    throw new Error("Robot not found");
  }

  type PushState = { ends: string[]; affected: Set<Cell<CellType2>> };

  function push(
    box: Cell<CellType2>,
    direction: Direction,
    state: PushState = {
      ends: [],
      affected: new Set(),
    },
    otherHalf = false
  ): PushState {
    const { ends, affected } = state;

    if (box.value === "#" || box.value === ".") {
      // end of the line
      ends.push(box.value);
      return state;
    }

    if (affected.has(box)) {
      return state;
    }

    affected.add(box);
    if (direction[1] !== 0) {
      if (box.value === "[") {
        if (!otherHalf) {
          const [right] = box.getNeighbors([Directions.east]);
          push(right!, direction, state, true);
        }
      } else {
        if (!otherHalf) {
          const [left] = box.getNeighbors([Directions.west]);
          push(left!, direction, state, true);
        }
      }

      const [left, ahead, right] = box.getNeighbors([
        [-1, direction[1]],
        direction,
        [1, direction[1]],
      ]);

      const cellsOfInterest: Cell<CellType2>[] = [ahead!];

      if (box.value === "[") {
        cellsOfInterest.push(right!);
      } else if (box.value === "]") {
        cellsOfInterest.push(left!);
      }

      for (const c of cellsOfInterest) {
        push(c!, direction, state);
      }
      return state;
    } else {
      const [ahead] = box.getNeighbors([direction]);
      return push(ahead!, direction, state);
    }
  }

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const [ahead] = robot.getNeighbors([move]);

    if (ahead!.value === "#") {
      continue;
    }

    if (ahead!.value === ".") {
      grid.swap(robot, ahead!);
      continue;
    }

    const pushPath = push(ahead!, move);

    const freeToPush = pushPath.ends.every((e) => e === ".");
    if (!freeToPush) {
      continue;
    }

    pushPath.affected.add(robot);
    grid.shift(pushPath.affected, move);
  }

  const sum = grid.cells
    .filter((c) => c.value === "[")
    .map((c) => c.position.y * 100 + c.position.x)
    .sort()
    .reduce((acc, c) => acc + c, 0)
    .toString();
  return sum.toString();
}

// const input = fs.readFileSync("input.txt", "utf-8");
// const parsed = setup(input, 2);
// console.log("re", part2(parsed));
