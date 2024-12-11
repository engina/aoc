export class Node<T> {
  constructor(public value: T, public next?: Node<T>) {}
  public append(node: Node<T>) {
    this.next = node;
  }

  public toArray(): Node<T>[] {
    const result: Node<T>[] = [];
    let current: Node<T> | undefined = this;
    while (current) {
      result.push(current);
      current = current.next;
    }
    return result;
  }

  public walk(
    cb: (n: Node<T>, path: Node<T>[], root: Node<T>) => Node<T> | undefined
  ) {
    let current: Node<T> | undefined = this;
    while (current) {
      const next = cb(current, this);
      current = next;
    }
  }
}
