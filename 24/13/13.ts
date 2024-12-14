import { parseDict2 } from "../../lib/parse";
import { bench, range } from "../../lib";
import { Vector2 } from "../../lib/grid";
import { amemo } from "amemo";

export const parse = (input: string) => {
  const parsed = parseDict2(input, {
    transformValues: (v) => {
      const [x, y] = v.split(", ");
      return [parseInt(x.slice(2)), parseInt(y.slice(2))];
    },
  });
  return range(0, parsed.length, 3)
    .map((i) => {
      const [[, a], [, b], [, prize]] = parsed.slice(i, i + 3);
      return {
        prize: new Vector2(prize[0], prize[1]),
        a: {
          cost: 3,
          translation: new Vector2(a[0], a[1]),
        },
        b: {
          cost: 1,
          translation: new Vector2(b[0], b[1]),
        },
      };
    })
    .filter((m) => m !== null) as Machine[];
};

type Button = {
  cost: number;
  translation: Vector2;
};

export type Machine = {
  prize: Vector2;
  a: Button;
  b: Button;
};

function int(n: number, epsilon = 0.0001) {
  const ni = Math.round(n);
  if (Math.abs(n - ni) < epsilon) {
    return ni;
  }
  return false;
}

/**
 * Order of operations does not matter.
 *
 * As long as you press the same buttons the same number of times, you will get the same result.
 *
 * i.e. BABABB is the same as as AABBBB
 *
 * So, what ever the movements of the each button are, they will reach the prize point (or not)
 * with the following way:
 *
 * |              # Prize (14,6)   |              # Prize (14,6)
 * |          +B                   |             *A
 * |      +B                       |         +B
 * |  +B                           |     +B
 * | *A                            |    *A
 * |*A                             |+B
 * +--------------#--+             +--------------#--+
 *  1   5    10   14               1   5    10   14
 *
 * You can also change the order of the buttons, it will not change where it will reach.
 *
 * So, in fact, this problem has a single solution, per machine. (And single cost too)
 * It either has a soltuion or not -- no multiple, optimal, sub optimal solutions.
 *
 * We know the exact location of the Prize (P) and slope of B's movement vector (mb).
 *
 * So we precisely have the equation of the line that B moves on.
 *
 * We also know the slope of A's movement vector (ma) and one point it passes (0, 0).
 *
 * We have the equation of the line that A moves on as well.
 *
 * We can calculate the intersection (xi) point of these two lines.
 *
 * Check if the intersection point is integer. If so, we've found the only solution.
 *
 * So, button A will be pressed xi times and button B will be pressed (P.x - xi) times.
 */
export function cost(m: Machine): number | null {
  const mb = m.b.translation.m();
  const n = m.prize.x - m.prize.y / mb;
  const xi = (-n * mb) / (m.a.translation.m() - mb);

  let stepsA: number | false = xi / m.a.translation.x;
  stepsA = int(stepsA);
  if (stepsA === false) {
    return null;
  }

  const left = m.prize.x - xi;
  let stepsB: number | false = left / m.b.translation.x;
  stepsB = int(stepsB);
  if (!stepsB) {
    return null;
  }

  return stepsA * m.a.cost + stepsB * m.b.cost;
}
