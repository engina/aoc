import { bench } from "../../lib";
import { Grid, Vector2 } from "../../lib/grid";
import colors from "colors";

export function setup(input: string) {
  const keypadCode = new Grid<string>([
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    [" ", "0", "A"],
  ]);

  const keypadArm = new Grid<string>([
    [" ", "^", "A"],
    ["<", "v", ">"],
  ]);

  const codes = input.trim().split("\n");

  return {
    codes,
    keypadCode,
    keypadArm,
  };
}

export type Input = ReturnType<typeof setup>;

class Robot {
  private target: Robot | undefined;

  constructor(
    public readonly name: string,
    public position: Vector2,
    public readonly pad: Grid<string>,
    public readonly controller?: Robot
  ) {
    if (controller) {
      if (controller.target) {
        throw new Error(
          `[${this.name}] controller already has controllee ${controller.target.name}`
        );
      }
      controller.setTarget(this);
    }
  }

  setTarget(target: Robot) {
    console.log(`[${this.name}] set target to ${target.name}`);
    this.target = target;
  }

  reverse(code: string): string {
    const start = this.position.clone();
    // let keys = "";
    const gap = this.pad.find(" ")!;
    let alternatives: string[] = [];
    for (const c of code) {
      const next = this.pad.find(c)!;
      const v = next.position.clone().sub(start);
      const isDirect = v.x === 0 || v.y === 0;
      const sameRowWithGap = start.y === gap.position.y;
      const minX = Math.min(start.x, next.position.x);
      const maxX = Math.max(start.x, next.position.x);
      const minY = Math.min(start.y, next.position.y);
      const maxY = Math.max(start.y, next.position.y);
      const doesNotInvolveGap =
        gap.position.x < minX ||
        gap.position.x > maxX ||
        gap.position.y < minY ||
        gap.position.y > maxY;
      const hkeys = v.x > 0 ? ">".repeat(v.x) : "<".repeat(-v.x);
      const vkeys = v.y > 0 ? "v".repeat(v.y) : "^".repeat(-v.y);
      const vFirst = vkeys + hkeys;
      const hFirst = hkeys + vkeys;
      const preferred = sameRowWithGap ? vFirst : hFirst;
      if (doesNotInvolveGap && !isDirect) {
        // try all combinations
        if (alternatives.length === 0) {
          alternatives.push(vFirst + "A");
          if (vFirst !== hFirst) alternatives.push(hFirst + "A");
        } else {
          let newAlternatives: string[] = [];
          alternatives.forEach((a) => {
            if (vFirst) newAlternatives.push(a + vFirst + "A");
            // if (vFirst !== hFirst) newAlternatives.push(a + hFirst + "A");
          });
          alternatives = newAlternatives;
        }
      } else {
        // try only one
        if (alternatives.length) {
          alternatives = alternatives.map((a) => a + preferred + "A");
        } else {
          alternatives.push(preferred + "A");
        }
      }
      start.add(v);
    }

    // console.log(`[${this.name}] type ${code} -> ${alternatives}`);
    if (this.controller) {
      const keys = alternatives.map((a) => this.controller!.reverse(a));
      keys.sort((a, b) => a.length - b.length);
      return keys[0];
    } else {
      return alternatives.sort((a, b) => a.length - b.length)[0];
    }
    // this.position.set(start);
  }

  press(key: string): string {
    // console.log(`[${this.name}] press ${key}`);
    const gap = this.pad.find(" ")!;
    const current = this.pad.get(this.position)!;
    current.value = colors.bgMagenta(current.value);
    switch (key) {
      case "^":
        this.position.y--;
        break;
      case "v":
        this.position.y++;
        break;
      case "<":
        this.position.x--;
        break;
      case ">":
        this.position.x++;
        break;
      case "A":
        const val = this.pad.get(this.position);
        if (!val) {
          throw new Error(`[${this.name}] out of bounds at ${this.position}`);
        }
        this.print(colors.bgRed);
        if (this.target) return this.target.press(val.value);
        else {
          return val.value;
        }
    }
    if (
      this.position.x < 0 ||
      this.position.y < 0 ||
      this.position.x >= this.pad.width ||
      this.position.y >= this.pad.height
    ) {
      throw new Error(`[${this.name}] out of bounds at ${this.position}`);
    }

    if (this.position.isEqual(gap.position)) {
      throw new Error(`[${this.name}] fell into gap at ${this.position}`);
    }
    // this.print();
    return "";
  }

  print(color: colors.Color = colors.bgBlue) {
    const buttonUnderArm = this.pad.cells.find((c) =>
      c.position.isEqual(this.position)
    );
    if (!buttonUnderArm) {
      throw new Error(`[${this.name}] fell into gap at ${this.position}`);
    }
    buttonUnderArm.value = color(colors.strip(buttonUnderArm.value));
    // console.log(`[${this.name}] arm at ${this.position}`);
    this.pad.print();
    this.pad.cells.forEach((c) => (c.value = colors.strip(c.value)));
  }
}

export function part1(input: Input) {
  const { codes, keypadCode, keypadArm } = input;
  const dirRobot1 = new Robot(
    "numeric1".red,
    new Vector2(2, 0),
    keypadArm,
    undefined
  );
  const dirRobot2 = new Robot(
    "numeric2".green,
    new Vector2(2, 0),
    keypadArm,
    dirRobot1
  );
  const codeRobot = new Robot(
    "code".blue,
    new Vector2(2, 3),
    keypadCode,
    dirRobot2
  );

  function reset() {
    dirRobot1.position.set([2, 0]);
    dirRobot2.position.set([2, 0]);
    codeRobot.position.set([2, 3]);
  }

  // let test = "101A";
  // let test = "000A";
  // console.log(test, codeRobot.reverse(test));
  // console.log(
  //   "back",
  //   codeRobot
  //     .reverse(test)
  //     .split("")
  //     .map((s) => dirRobot1.press(s))
  //     .join("")
  // );
  // return;
  let sum = 0;
  for (const code of codes) {
    const p = codeRobot.reverse(code);
    let simresult = p
      .split("")
      .map((s) => dirRobot1.press(s))
      .join("");
    if (code === simresult) {
      simresult = simresult.bgGreen;
    } else {
      simresult = simresult.bgRed;
    }
    reset();
    console.log("sim result", simresult);
    console.log(
      "code",
      code,
      p.length,
      parseInt(code),
      p.length * parseInt(code),
      p
    );
    sum += p.length * parseInt(code);
  }
  return sum.toString();
}

export function part2(input: Input) {
  const { codes, keypadCode, keypadArm } = input;
  let prev: Robot | undefined = undefined;
  const dirRobots: Robot[] = Array.from({ length: 25 }, (_, i) => {
    const r = new Robot(
      `numeric${i + 1}`.red,
      new Vector2(2, 0),
      keypadArm,
      prev
    );
    prev = r;
    return r;
  });
  const codeRobot = new Robot(
    "code".blue,
    new Vector2(2, 3),
    keypadCode,
    dirRobots[dirRobots.length - 1]
  );

  function reset() {
    // dirRobot1.position.set([2, 0]);
    // dirRobot2.position.set([2, 0]);
    dirRobots.forEach((r) => r.position.set([2, 0]));
    codeRobot.position.set([2, 3]);
  }

  let sum = 0;
  for (const code of codes) {
    const p = codeRobot.reverse(code);
    let simresult = p
      .split("")
      .map((s) => dirRobots[0].press(s))
      .join("");
    if (code === simresult) {
      simresult = simresult.bgGreen;
    } else {
      simresult = simresult.bgRed;
    }
    reset();
    // console.log("sim result", simresult);
    // console.log(
    //   "code",
    //   code,
    //   p.length,
    //   parseInt(code),
    //   p.length * parseInt(code),
    //   p
    // );
    sum += p.length * parseInt(code);
  }
  return sum.toString();
}

let input = ``;

input = `029A
980A
179A
456A
379A
`;

import fs from "fs";
input = fs.readFileSync("input.txt", "utf8");

bench(
  () => {
    console.log(part2(setup(input)));
  },
  { runs: 1 }
);

/**
 * 
  press(to: string): string[] {
    // console.log(`[${this.name}] press ${to}`);
    if (this.parent) {
      const next = this.pad.find(to)!;
      const v = next.position.clone().sub(this.position);
      // console.log("parent", this.parent.name);
      let presses: string[] = [
        ...(v.x > 0 ? ">".repeat(v.x) : "<".repeat(-v.x)).split(""),
        ...(v.y > 0 ? "v".repeat(v.y) : "^".repeat(-v.y)).split(""),
        "A",
      ];
      // console.log(
      //   `[${this.name}] requires to ${presses.join("")} to press ${to}`
      // );
      presses = presses.map((p) => this.parent!.press(p)).flat();
      // console.log(
      //   `[${this.name}] moves to ${to} with ${presses.join("")} (parent)`
      // );
      // console.log(`[${this.name}] moves to ${to} with ${presses.join("")}`);
      this.position.set(next.position);
      return presses;
    } else {
      // no parent, so each key press must be followed by A
      const presses = [to];
      // console.log(
      //   `[${this.name}] requires to ${presses.join("")} to press ${presses.join(
      //     ""
      //   )} (no parent)`
      // );
      return presses;
    }
  }
 */
// <v<A>>^AvA^A <vA<AA>>^AAvA<^A>AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A
// v<<A^>>AvA^A v<<A^>>AAv<A<A^>>AA<Av>AA^Av<A^>AA<A>Av<A<A^>>AAA<Av>A^A
/*
+---+---+---+
| 7 | 8 | 9 |
+---+---+---+
| 4 | 5 | 6 |
+---+---+---+
| 1 | 2 | 3 |
+---+---+---+
    | 0 | A |     m0
    +---+---+
  \   o  O    /  <-- Depressurize

+----------------
|     +---+---+ |
|     | ^ | A | | 
| +---+---+---+ | 
| | < | v | > | | m>,mv,m<,<
| +---+---+---+ |
+=--------------+
  /    o O   /    <-- Radiation


+---------------+
|     +---+---+ |
|     | ^ | A | |
| +---+---+---+ | v,<,<,A,>
| | < | v | > | |
| +---+---+---+ |
+---------------+
   (   o O   )    <-- -40 C


+---------------+
|     +---+---+ |
|     | ^ | A | |
| +---+---+---+ | <vA<AA>>^AvA
| | < | v | > | |
| +---+---+---+ |
+---------------+
*/

// 126712 too high
