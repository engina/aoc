export function* combinations<T>(arr: T[], N: number) {
  const indexes = Array.from({ length: N }, (_, i) => i);
  while (true) {
    const result = indexes.map((i) => arr[i]);
    yield result;
    let i = N - 1;
    while (i >= 0 && indexes[i] === arr.length - N + i) {
      i--;
    }
    if (i < 0) {
      break;
    }
    indexes[i]++;
    for (let j = i + 1; j < N; j++) {
      indexes[j] = indexes[i] + j - i;
    }
  }
}

// permutation generator
// can handle where arr.length < N
export function* permutations<T>(arr: T[], N: number) {
  let i = 0;
  let end = arr.length ** N;
  while (i < end) {
    const result = Array.from({ length: N }, (_, j) => {
      const index = Math.floor(i / arr.length ** j) % arr.length;
      return arr[index];
    });
    yield result;
    i++;
  }
}

// create a unique element from an array filter
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function* genRange(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

export function range(start, end, step = 1) {
  const forEach = (fn) => {
    for (const i of genRange(start, end, step)) {
      fn(i);
    }
    return this;
  };

  const map = <T>(fn: (...args: any[]) => T) => {
    const result: T[] = [];
    for (const i of genRange(start, end, step)) {
      result.push(fn(i));
    }

    return result;
  };
  return { forEach, map };
}

import "colors";
export type BenchOpts = {
  label?: string;
  disablePrint?: boolean;
  runs?: number;
  discard?: number;
};

export const bench = <R>(fn: () => R, opts: BenchOpts = {}) => {
  const { label = "Bench", disablePrint = false } = opts;

  function run() {
    const start = performance.now();
    const result = fn();
    const elapsed = performance.now() - start;
    return { result, elapsed };
  }

  let runs = opts.runs ?? 10;

  if (runs < 1) runs = 1;

  let discard = opts.discard;

  if (discard === undefined) {
    discard = Math.floor(runs / 4);
  }

  if (runs - discard * 2 < 2) discard = 0;

  const results = range(0, runs)
    .map(() => run())
    .sort((a, b) => b.elapsed - a.elapsed);

  const max = results[0].elapsed;
  const min = results[runs - 1].elapsed;
  const avg =
    results
      .slice(discard, discard ? -discard : results.length)
      .reduce((acc, { elapsed }) => acc + elapsed, 0) /
    (results.length - discard * 2);
  if (!disablePrint) {
    console.log(
      `[${label ?? "Bench"}]`.gray +
        ` Avg: ${(avg.toFixed(2) + "ms").green} Max: ${
          (max.toFixed(2) + "ms").red
        } Min: ${(min.toFixed(2) + "ms").blue} Runs: ${
          runs.toString().magenta
        } Discard top/bottom: ${discard.toString().yellow}`
    );
  }
  return {
    results,
    avg,
    max,
    min,
  };
};
