// Optimizations:
// 1. unshift || and * operands (to the head of the queue) because those are harder to satisfy and is a strong signal
// 2. push + operands as it is very often satisfied

function solve(e: number, o: number[], concatEnable = false) {
  const queue = [[e, [...o]]] as [number, number[]][];
  while (queue.length) {
    const [expected, operands] = queue.shift()!;
    const lastOperand = operands.pop()!;

    if (operands.length === 0) {
      if (lastOperand === expected) return true;
      continue;
    }

    if (expected % lastOperand === 0) {
      queue.unshift([expected / lastOperand, [...operands]]);
    }

    if (concatEnable) {
      const eStr = expected.toString();
      const lastOperandStr = lastOperand.toString();
      if (eStr.endsWith(lastOperandStr)) {
        queue.unshift([
          parseInt(eStr.slice(0, -lastOperandStr.length)),
          [...operands],
        ]);
      }
    }

    if (expected > lastOperand) {
      queue.push([expected - lastOperand, [...operands]]);
    }
  }
  return false;
}

export function part1(parsed: [number, number[]][]) {
  return run(parsed, false);
}

export function part2(parsed: [number, number[]][]) {
  return run(parsed, true);
}

export function run(parsed: [number, number[]][], concatEnable: boolean) {
  const result = parsed.map(
    ([expected, operands]) =>
      [expected, solve(expected, operands, concatEnable)] as [number, boolean]
  );

  return result
    .filter((a) => a[1])
    .map((a) => a[0])
    .reduce((acc, cur) => acc + cur, 0)
    .toString();
}
