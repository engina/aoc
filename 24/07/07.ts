import fs from "fs";
import assert from "assert";
import { parseDict, Transformers } from "../../lib/parse";
import { permutations } from "../../lib";

const input = fs.readFileSync("input.txt", "utf-8");

// const input = `190: 10 19
// 3267: 81 40 27
// 83: 17 5
// 156: 15 6
// 7290: 6 8 6 15
// 161011: 16 10 13
// 192: 17 8 14
// 21037: 9 7 18 13
// 292: 11 6 16 20
// `;

const parsed = parseDict(input, Transformers.number, Transformers.number);

console.log(`Validating`);

parsed.forEach(([expected, operands]) => {
  assert(Number.isInteger(Number(expected)));
  assert(Array.isArray(operands));
  assert(operands.length >= 2);
});

console.log(`Validated ${Object.keys(parsed).length} entries`);

// console.log(parsed);
// process.exit(0);

type Operetor = (a: bigint, b: bigint) => bigint;

const mul = (a: bigint, b: bigint) => a * b;
const add = (a: bigint, b: bigint) => a + b;

const operatorsDict: Record<string, Operetor> = {
  "*": mul,
  "+": add,
};

const operatorsArr = Object.entries(operatorsDict);

function solve(expected: bigint, operands: number[]) {
  // console.log("Solving", expected, operands.join(" "));
  for (const operatorCombination of permutations(
    operatorsArr,
    operands.length - 1
  )) {
    let result = BigInt(operands[0]);
    for (let i = 1; i < operands.length; i++) {
      const op2 = BigInt(operands[i]);
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

let sum = BigInt(0);
parsed
  .filter(([expected, operands]) => {
    return true;
    return expected === 2901484800000;
  })
  .map(([expected, operands]) => {
    return [expected, operands, solve(BigInt(expected), operands)] as [
      number,
      number[],
      string | undefined
    ];
    // return solve(Number(expected), operands);
  })
  .filter(([, , solution]) => solution !== undefined)
  .forEach(([expected, operands, solution]) => {
    console.log(expected, operands.join(" "), solution);
    sum += BigInt(expected);
  });

console.log(sum);

// 4 122 618 555 677 too low
