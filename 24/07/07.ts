import fs from "fs";
import assert from "assert";
import { parseDict, Transformers } from "../../lib/parse";
import { permutations } from "../../lib";

export function setup(input: string) {
  return parseDict(input, Transformers.number, Transformers.number);
}

// console.log(`Validating`);

// parsed.forEach(([expected, operands]) => {
//   assert(Number.isInteger(Number(expected)));
//   assert(Array.isArray(operands));
//   assert(operands.length >= 2);
// });

// console.log(`Validated ${Object.keys(parsed).length} entries`);

// console.log(parsed);
// process.exit(0);

type Operetor = (a: number, b: number) => number;

const mul = (a: number, b: number) => a * b;
const add = (a: number, b: number) => a + b;

const operatorsDict: Record<string, Operetor> = {
  "*": mul,
  "+": add,
};

const operatorsArr = Object.entries(operatorsDict);

function solve(expected: number, operands: number[]) {
  // console.log("Solving", expected, operands.join(" "));
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

    // console.log(
    //   "Trying",
    //   operatorCombination.map(([op]) => op).join(" "),
    //   "to reach",
    //   expected,
    //   "got",
    //   result
    // );
    if (result === expected) {
      // console.log("Found it");
      return operatorCombination.map(([op]) => op).join(" ");
    }
  }
  return undefined;
}

// let i = 0;
// for (const perm of permutations(operatorsArr, 5)) {
//   console.log(i++, perm.map(([op]) => op).join(" "));
// }

export function run(parsed) {
  let sum = 0;
  parsed
    .filter(([expected, operands]) => {
      return true;
    })
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
