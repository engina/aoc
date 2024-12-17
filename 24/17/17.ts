import assert from "assert";
import { parseDict2, Transformers } from "../../lib/parse";
import fs from "fs";

let input = `Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0
`;

input = fs.readFileSync("input.txt", "utf-8");

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

type Instruction = [Opcode, number];

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

  step() {
    const opcode = this.memory[this.PC];
    const operand = this.memory[this.PC + 1];
    if (this.PC < 0 || this.PC >= this.memory.length) {
      return false;
      // throw new Error(`PC out of bounds: ${this.PC}`);
    }
    assert(opcode >= 0 && opcode <= 7);
    switch (opcode) {
      case Opcode.ADV:
        const numerator = this.A;
        const denominator = 2 ** this.compound(operand);
        this.A = Math.trunc(numerator / denominator);
        this.PC += 2;
        break;
      case Opcode.BXL:
        this.B = this.B ^ operand;
        this.PC += 2;
        break;
      case Opcode.BST:
        this.B = this.compound(operand) % 8;
        this.PC += 2;
        break;
      case Opcode.JNZ:
        if (this.A !== 0) {
          this.PC = operand;
          break;
        }
        this.PC += 2;
        break;
      case Opcode.BXC:
        this.B = this.B ^ this.C;
        this.PC += 2;
        break;
      case Opcode.OUT:
        this.stdout.push(this.compound(operand) % 8);
        console.log(this.stdout.join(","));
        this.PC += 2;
        break;
      case Opcode.BDV: {
        const numerator = this.A;
        const denominator = 2 ** this.compound(operand);
        this.B = Math.trunc(numerator / denominator);
        this.PC += 2;
        break;
      }
      case Opcode.CDV: {
        const numerator = this.A;
        const denominator = 2 ** this.compound(operand);
        this.C = Math.trunc(numerator / denominator);
        this.PC += 2;
        break;
      }
    }
    return true;
  }

  compound(value: number) {
    if (value >= 0 && value <= 3) return value;
    if (value === 4) return this.A;
    if (value === 5) return this.B;
    if (value === 6) return this.C;
    throw new Error(`Invalid compound value ${value}`);
  }
}

const c = new Computer(input);
while (c.step());

// 7,4,2,5,1,4,6,0,4
