import "colors";
import { parseDict2 } from "../../lib/parse";
import { bench, range } from "../../lib";
import { Vector2 } from "../../lib/grid";

import fs from "fs";
let input = fs.readFileSync("input.txt", "utf-8");

const parsed = parseDict2(input, {
  transformValues: (v) => {
    const [x, y] = v.split(", ");
    return [parseInt(x.slice(2)), parseInt(y.slice(2))];
  },
});

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
  ) {
    prize.x += 10000000000000;
    prize.y += 10000000000000;
  }

  toString() {
    return (
      `Prize: ${this.prize.toString()}`.green +
      ` Button A: ${this.a}`.yellow +
      ` Button B: ${this.b}`.blue
    );
  }
}

const machines = range(0, parsed.length, 3)
  .map((i) => {
    const [[, a], [, b], [, prize]] = parsed.slice(i, i + 3);
    return new Machine(
      new Vector2(prize[0], prize[1]),
      new Button(3, new Vector2(a[0], a[1])),
      new Button(1, new Vector2(b[0], b[1]))
    );
  })
  .filter((m) => m !== null) as Machine[];

function isInteger(n: number, epsilon = 0.0001) {
  return Math.abs(n - Math.round(n)) < epsilon;
}

function costt(m: Machine): number | null {
  const mb = m.b.translation.m();
  const n = m.prize.x - m.prize.y / mb;
  const xi = (-n * mb) / (m.a.translation.m() - mb);

  let stepsA = xi / m.a.translation.x;

  if (!isInteger(stepsA)) {
    return null;
  }
  stepsA = Math.round(stepsA);

  const left = m.prize.x - xi;
  let stepsB = left / m.b.translation.x;
  if (!isInteger(stepsB)) {
    return null;
  }
  stepsB = Math.round(stepsB);

  return stepsA * m.a.cost + stepsB * m.b.cost;
}

bench(() => {
  console.log(
    "cost",
    machines
      .map(costt)
      .filter((c) => {
        // console.log(c);
        return c !== null;
      })
      .reduce((a, b) => a + b, 0)
  );
});
