import "colors";
import { parseDict2 } from "../../lib/parse";
import { range } from "../../lib";
import { Vector2 } from "../../lib/grid";

import fs from "fs";
let input: string = "";
// let input = fs.readFileSync("input.txt", "utf-8");
input = `Button A: X+94, Y+34
Button B: X+22, Y+67
Prize: X=8400, Y=5400

Button A: X+26, Y+66
Button B: X+67, Y+21
Prize: X=12748, Y=12176

Button A: X+17, Y+86
Button B: X+84, Y+37
Prize: X=7870, Y=6450

Button A: X+69, Y+23
Button B: X+27, Y+71
Prize: X=18641, Y=10279
`;

export const run = (input: string) => {
  return "";
};

const parsed = parseDict2(input, {
  transformValues: (v) => {
    const [x, y] = v.split(", ");
    return [parseInt(x.slice(2)), parseInt(y.slice(2))];
  },
});

export function parse(input: string) {
  return parseDict2(input, {
    transformValues: (v) => {
      const [x, y] = v.split(", ");
      return [parseInt(x.slice(2)), parseInt(y.slice(2))];
    },
  });
}

class Button {
  constructor(
    public readonly cost: number,
    public readonly translation: Vector2
  ) {}
  toString() {
    return `Cost: ${this.cost} Translation: ${this.translation.toString()}`;
  }
}

class Machine {
  constructor(
    public readonly prize: Vector2,
    public readonly a: Button,
    public readonly b: Button
  ) {}

  toString() {
    return (
      `Prize: ${this.prize.toString()}`.green +
      ` Button A: ${this.a}`.yellow +
      ` Button B: ${this.b}`.blue
    );
  }
}

const machines = range(0, parsed.length, 3).map((i) => {
  const [[, a], [, b], [, prize]] = parsed.slice(i, i + 3);
  return new Machine(
    new Vector2(prize[0], prize[1]),
    new Button(3, new Vector2(a[0], a[1])),
    new Button(1, new Vector2(b[0], b[1]))
  );
});

function findSmallestMultipliers(
  target: number,
  a: number,
  b: number,
  max = 100
): [number, number][] {
  const [bigger, smaller] = a > b ? [a, b] : [b, a];
  let bigMultiplier = Math.min(max, Math.floor(target / bigger));
  let smallMultiplier = -1;
  const results: [number, number][] = [];
  do {
    const remainder = target - bigger * bigMultiplier;

    console.log(`Trying ${bigMultiplier} -> remainder ${remainder} ${smaller}`);
    if (remainder % smaller === 0) {
      smallMultiplier = remainder / smaller;
      if (smallMultiplier > max) {
        break;
      }
      results.push([bigMultiplier, smallMultiplier]);
    }
    bigMultiplier--;
  } while (bigMultiplier > 0);

  if (smallMultiplier === -1) {
    return [];
  }

  return a < b ? results.map(([x, y]) => [y, x]) : results;
}

function findLeastExpensiveMultipliers(machine: Machine, max = 100) {
  const { prize, a, b } = machine;
  const solX = findSmallestMultipliers(
    prize.x,
    a.translation.x,
    b.translation.x,
    max
  );
  const solY = findSmallestMultipliers(
    prize.y,
    a.translation.y,
    b.translation.y,
    max
  );
  // find common solutions
  const common = solX
    .filter(([x1, y1]) => solY.some(([x2, y2]) => x1 === x2 && y1 === y2))
    .map(([x, y]) => [x, y, x * a.cost + y * b.cost]);
  return {
    common,
  };
}

// let win = 0;
// let cost = 0;
// for (const m of machines) {
//   const r = findLeastExpensiveMultipliers(m);
//   if (r.common.length === 0) {
//     console.log(`No solution for ${m}`);
//     continue;
//   }
//   win++;
//   console.log("common", r.common);
//   const [a, b, c] = r.common.sort((a, b) => a[2] - b[2])[0];
//   console.log(`Winning machine: ${m}`, a, b);
//   cost += c;
// }
// console.log(win, cost);

// let win = 0;
// let cost = 0;
// for (const m of machines.map(
//   (m) => new Machine(m.prize.clone().addScalar(10000000000000), m.b, m.a)
// )) {
//   const r = findLeastExpensiveMultipliers(m, 10000000000000);
//   if (r.common.length === 0) {
//     console.log(`No solution for ${m}`);
//     continue;
//   }
//   win++;
//   console.log("common", r.common);
//   const [a, b, c] = r.common.sort((a, b) => a[2] - b[2])[0];
//   console.log(`Winning machine: ${m}`, a, b);
//   cost += c;
// }
// console.log(win, cost);
// // 131 26005
