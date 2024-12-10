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

export const bench = <R>(fn: () => R, label?: string, disabled = false) => {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;
  if (!disabled)
    console.log(`[${label ?? "Bench"}] took: ${elapsed.toFixed(2)}ms`);
  return result;
};
