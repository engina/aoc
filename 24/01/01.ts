export function part1([a, b]: [number[], number[]]) {
  a.sort();
  b.sort();

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum.toString();
}

export function part2([a, b]: [number[], number[]]) {
  a.sort();
  b.sort();

  let similar = 0;
  for (let i = 0; i < a.length; i++) {
    const needle = a[i];
    const n = b.filter((x) => x === needle).length;
    similar += a[i] * n;
  }

  return similar.toString();
}
