import { permutations } from "../../lib";

type Operetor = (a: number, b: number) => number;

const mul = (a: number, b: number) => a * b;
const add = (a: number, b: number) => a + b;
const concat = (a: number, b: number) => Number(`${a}${b}`);

const operatorsDict: Record<string, Operetor> = {
  "*": mul,
  "+": add,
  "||": concat,
};

const operatorsArr = Object.entries(operatorsDict);

function solve(expected: number, operands: number[]) {
  for (const operatorCombination of permutations(
    operatorsArr,
    operands.length - 1
  )) {
    let result = operands[0];
    for (let i = 1; i < operands.length; i++) {
      const op2 = operands[i];
      const [, operator] = operatorCombination[i - 1];
      result = operator(result, op2);
    }
    if (result === expected) {
      return operatorCombination.map(([op]) => op).join(" ");
    }
  }
  return undefined;
}

export function run(parsed: [number, number[]][]) {
  let sum = 0;
  parsed
    .map(([expected, operands]) => {
      return [expected, operands, solve(expected, operands)] as [
        number,
        number[],
        string | undefined
      ];
    })
    .filter(([, , solution]) => solution !== undefined)
    .forEach(([expected, operands, solution]) => {
      // console.log(expected, operands.join(" "), solution);
      sum += expected;
    });
  return sum.toString();
}
