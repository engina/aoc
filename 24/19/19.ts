export function setup(input: string) {
  const lines = input.trim().split("\n");
  const patternsInStock = lines[0].split(", ");
  const patternsDesired = lines.slice(2);
  return { patternsInStock, patternsDesired };
}

export type Input = ReturnType<typeof setup>;

function walk(
  desired: string,
  available: string[],
  cache: Record<string, number> = {}
) {
  if (!desired) return 1;

  if (cache[desired]) {
    return cache[desired];
  }

  const next = available.filter((a) => desired.startsWith(a));
  let sum = 0;
  next.forEach((n) => (sum += walk(desired.slice(n.length), available, cache)));
  cache[desired] = sum;
  return sum;
}

const sharedCache: Record<string, {}> = {};

export function part1({ patternsInStock, patternsDesired }: Input) {
  return patternsDesired
    .map((d) =>
      walk(d, patternsInStock, sharedCache[d] ?? (sharedCache[d] = {}))
    )
    .filter((n) => n > 0)
    .length.toString();
}

export function part2({ patternsInStock, patternsDesired }: Input) {
  return patternsDesired
    .map((d) => walk(d, patternsInStock, sharedCache[d]))
    .reduce((acc, curr) => acc + curr, 0)
    .toString();
}
