import assert from "assert";
import { parseDict2, Transformers } from "../../lib/parse";
import fs from "fs";
import { bench } from "../../lib";

let input = `Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0
`;

// input = fs.readFileSync("input.txt", "utf-8");

enum Opcode {
  ADV = 0, // The numerator is the value in the A register. The denominator is found by raising 2 to the power of the instruction's combo operand. (So, an operand of 2 would divide A by 4 (2^2); an operand of 5 would divide A by 2^B.) The result of the division operation is truncated to an integer and then written to the A register.
  BXL = 1, // calculates the bitwise XOR of register B and the instruction's literal operand, then stores the result in register B.
  BST = 2, // calculates the value of its combo operand modulo 8 (thereby keeping only its lowest 3 bits), then writes that value to the B register.
  JNZ = 3,
  BXC = 4,
  OUT = 5,
  BDV = 6,
  CDV = 7,
}

const debug = (...args: any[]) => true && console.log(...args);

export function setup(input: string) {
  return new Computer(input);
}
export type Input = Computer;

export function part1(c: Computer) {
  c.run();
  return c.stdout.join(",");
}

class Computer {
  public A: number = 0;
  public B: number = 0;
  public C: number = 0;
  public PC: number = 0;
  public memory: number[] = [];
  public stdout: number[] = [];

  constructor(program: string) {
    const parsed = parseDict2(program, {
      transformKey: Transformers.string,
      transformValues: (numbers) => numbers.split(",").map(Number),
    });
    parsed.forEach(([key, value]) => {
      if (key === "Register A") this.A = value[0];
      if (key === "Register B") this.B = value[0];
      if (key === "Register C") this.C = value[0];
      if (key === "Program") this.memory = value;
    });
  }

  run(expectedOutput?: number[]) {
    while (this.step());
    return this.stdout;
  }

  step() {
    // debug(OpcodeNames[opcode], operand);
    if (this.PC < 0 || this.PC >= this.memory.length) {
      this.PC = 0;
      return false;
      // throw new Error(`PC out of bounds: ${this.PC}`);
    }
    const opcode = this.memory[this.PC];
    const operand = this.memory[this.PC + 1];
    assert(opcode >= 0 && opcode <= 7);
    switch (opcode) {
      case Opcode.ADV:
        const numerator = this.A;
        const denominator = 2 ** this.compound(operand);
        this.A = Math.trunc(numerator / denominator);
        debug(
          `ADV 0,${operand}: A = A(${numerator}) / ${denominator}`.padEnd(
            30,
            " "
          ) +
            `= ${this.A}` +
            `0b${this.A.toString(2)}`.padStart(32, " ")
        );
        this.PC += 2;
        break;
      case Opcode.BXL:
        this.B = this.B ^ operand;
        debug(
          `BXL 1,${operand}: B = B ^ ${operand}`.padEnd(30, " ") + `= ${this.B}`
        );
        this.PC += 2;
        break;
      case Opcode.BST:
        const resolved = this.compound(operand) % 8;
        debug(
          `BST 2,${operand}: B = ${
            operand > 3 && `(${operand}->${this.compound(operand)}`
          }) % 8`.padEnd(30, " ") + `= ${resolved}`
        );
        this.B = resolved;
        this.PC += 2;
        break;
      case Opcode.JNZ:
        if (this.A !== 0) {
          this.PC = operand;
          debug(`JNZ 3,${operand}: PC = ${operand}`.red);
          break;
        }
        this.PC += 2;
        break;
      case Opcode.BXC:
        this.B = this.B ^ this.C;
        debug(`BXC 4,${operand}: B = B ^ C`.padEnd(30, " ") + `= ${this.B}`);
        this.PC += 2;
        break;
      case Opcode.OUT:
        debug(
          `OUT 5,${operand}: print`.padEnd(30, " ") +
            `= ${this.compound(operand) % 8}`
        );
        this.stdout.push(this.compound(operand) % 8);
        this.PC += 2;
        break;
      case Opcode.BDV: {
        const numerator = this.A;
        const denominator = 2 ** this.compound(operand);
        debug(`BDV 6,${operand}: B = A(${numerator}) / ${denominator}`);
        this.B = Math.trunc(numerator / denominator);
        this.PC += 2;
        break;
      }
      case Opcode.CDV: {
        const numerator = this.A;
        const denominator = 2 ** this.compound(operand);
        const result = Math.trunc(numerator / denominator);
        debug(
          `CDV 7,${operand}: C = A(${numerator}) / ${denominator} `.padEnd(
            30,
            " "
          ) + `= ${result}`
        );
        this.C = result;
        this.PC += 2;
        break;
      }
    }
    return true;
  }

  compound(value: number) {
    if (value >= 0 && value <= 3) return value; // >>> 0;
    if (value === 4) return this.A; // >>> 0;
    if (value === 5) return this.B; // >>> 0;
    if (value === 6) return this.C; // >>> 0;
    throw new Error(`Invalid compound value ${value}`);
  }

  snapshot() {
    return {
      A: this.A,
      B: this.B,
      C: this.C,
      PC: this.PC,
      memory: [...this.memory],
    };
  }

  restore(snapshot: ReturnType<Computer["snapshot"]>) {
    this.A = snapshot.A;
    this.B = snapshot.B;
    this.C = snapshot.C;
    this.PC = snapshot.PC;
    this.memory = [...snapshot.memory];
  }
}

// const c = new Computer(input);
// // c.A = 0b111111111111111111111001001001001001;
// console.log(c.run());

// B = A % 8 // A & 0x7
// B = B ^ 1 // Flip LSB ((A & 0x7) ^ 1)
// C = A / B    // C = A / ((A & 0x7) ^ 1)
// B = B ^ 5    // ((A & 0x7) ^ 1) ^ 5 -> (A & 0x7) ^ 4
// B = B ^ C    // (A & 0x7) ^ 4) ^ (A / ((A & 0x7) ^ 1))
// OUT << B % 8 // (A & 0x7) ^ 4) ^ (A / ((A & 0x7) ^ 1)) & 0x7
// A = A / 8 // A >> 3
function reverse(ai: number, depth: number, expected: number) {
  console.log("reverse", ai, depth, expected);
  let a = ai;
  while (depth--) {
    for (let i = 0; i < 8; i++) {
      let b = a % 8;
      b = b ^ 1; // maybe unsign? >>> 0
      let c = Math.trunc(a / 2 ** b);
      b = b ^ 5;
      b = b ^ c;
      let out = b % 8;
      if (depth === 0 && out === expected) return i;
      a = a / 8;
    }
  }
  throw new Error("Not found");
}

function crack(code: number[]) {
  console.log("crack", code);
  let a = 0 >>> 0;
  for (let i = code.length - 1; i >= 0; i--) {
    const c = reverse(a, code.length - i, code[i]);
    a |= c;
    a <<= 3;
    console.log("new a", c, a.toString(2), a.toString(16));
  }
}
// console.log("crack", crack([2, 4, 1, 1, 7, 5, 1, 5, 4, 1, 5, 5, 0, 3, 3, 0]));
// console.log("crack", crack([7, 4, 2, 5, 1, 4, 6, 0, 4]));
// console.log("reverse", reverse(0, 1, 0));
// console.log("reverse", reverse(3 << 3, 2, 3));

// let A = 1;
// const s = c.snapshot();
// const expected = [2, 4, 1, 1, 7, 5, 1, 5, 4, 1, 5, 5, 0, 3, 3, 0];
// // const expected = [2, 2, 4];
// while (true) {
//   c.restore(s);
//   c.PC = 0;
//   if (A % 100000 === 0) console.log(A, c.stdout);
//   c.stdout = [];
//   // (A0:3_2' ^ (A/(A0:3_0'))) = X + (N << 3) // N in Z
//   c.A = A++;
//   const r = c.run(expected);
//   if (arrCmp(r, c.memory) && r.length === c.memory.length) {
//     console.log("found", A - 1, r);
//     break;
//   }
// }

// function arrCmp(a: number[], b: number[]) {
//   if (a === b) return true;
//   // if (a.length !== b.length) return false;
//   for (let i = 0; i < a.length; i++) {
//     if (a[i] !== b[i]) return false;
//   }
//   return true;
// }

// debug(c.snapshot());
// c.A += 4433446000;
let overrideA: number | undefined;

// while (true) {
//   const c = new Computer(input);
//   if (overrideA) c.A = overrideA;
//   const A = c.A;
//   console.log(`Trying A = ${A}`);
//   while (c.step()) {
//     if (c.stdout.length > c.memory.length) {
//       console.log("Output already bigger than program");
//       overrideA = A + 1;
//       break;
//     }
//     if (!arrCmp(c.stdout, c.memory)) {
//       console.log("Output does not match program");
//       overrideA = A + 1;
//       break;
//     } else if (c.stdout.length === c.memory.length) {
//       console.log(overrideA);
//       process.exit(0);
//     }
//   }
// }

// 7,4,2,5,1,4,6,0,4
