import { permutations } from "../../lib";
import { amemo, MemCacheStore } from "amemo";

type Operetor = (a: number, b: number) => number;

const mul = (a: number, b: number) => a * b;
const add = (a: number, b: number) => a + b;
const concat = (a: number, b: number) => {
  let p = Math.floor(Math.log10(b)) + 1;
  return a * Math.pow(10, p) + b;
};

const operatorsDict: Record<string, Operetor> = {
  "*": mul,
  "+": add,
  "||": concat,
};

const operatorsArr = Object.entries(operatorsDict);

const permute = amemo(
  (n: number) => {
    return [...permutations(operatorsArr, n)];
  },
  {
    cacheStore: new MemCacheStore(),
  }
);

function solve(expected: number, operands: number[]) {
  for (const operatorCombination of permute(operands.length - 1)) {
    let result = operands[0];
    let skipCombination = false;
    const [lastOp] = operatorCombination[operatorCombination.length - 1];
    const lastOperand = operands[operands.length - 1];
    switch (lastOp) {
      case "+":
        if (lastOperand > expected) {
          skipCombination = true;
        }
        break;
      case "*":
        if (expected % lastOperand !== 0) {
          skipCombination = true;
        }
        break;
      case "||":
        let p = Math.floor(Math.log10(lastOperand)) + 1;
        if (expected % Math.pow(10, p) !== lastOperand) {
          skipCombination = true;
        }
        break;
    }
    if (skipCombination) continue;

    for (let i = 1; i < operands.length; i++) {
      const op2 = operands[i];
      const [op, operator] = operatorCombination[i - 1];
      result = operator(result, op2);
    }

    if (result === expected) {
      return operatorCombination.map(([op]) => op).join(" ");
    }
  }
  return undefined;
}

export function run(parsed: [number, number[]][]) {
  return parsed
    .map(([expected, operands]) => {
      return [expected, operands, solve(expected, operands)] as [
        number,
        number[],
        string | undefined
      ];
    })
    .reduce((acc, [expected, operands, solution]) => {
      if (!solution) return acc;
      return acc + expected;
    }, 0)
    .toString();
}
