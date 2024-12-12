export class Node<T> {
  constructor(public value: T, public next?: Node<T>) {}
  public append(node: Node<T>) {
    this.next = node;
  }

  public walk<P>(
    cb: (
      n: Node<T>,
      payload: P | undefined,
      root: Node<T>
    ) => Node<T> | undefined,
    payload?: P
  ) {
    let current: Node<T> | undefined = this;
    while (current) {
      const next = cb(current, payload, this);
      current = next;
    }
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
