export class Node<T> {
  constructor(public value: T, public neighbors: Node<T>[] = []) {}

  public walk<P>(
    cb: (
      n: Node<T>,
      payload: P | undefined,
      root: Node<T>
    ) => Node<T> | undefined,
    payload?: P
  ) {
    let current: Node<T> | undefined = this;
    current.neighbors.forEach((n) => {
      const next = cb(n, payload, this);
      if (next) {
        current = next;
      }
    });
  }

  public toArray(): Node<T>[] {
    const result: Node<T>[] = [];
    this.walk((n) => {
      result.push(n);
      return n.next;
    });
    return result;
  }
}
