class NodeSorted<T> {
  constructor(
    public value: T,
    public prev: NodeSorted<T> | undefined = undefined,
    public next: NodeSorted<T> | undefined = undefined,
    public readonly cmp: (a: T, b: T) => number
  ) {}

  update(val: T) {}
}

class LinkedListSorted<T> {
  public head: NodeSorted<T> | undefined = undefined;
  public tail: NodeSorted<T> | undefined = undefined;

  constructor(private arr: T[], private cmp: (a: T, b: T) => number) {
    this.arr = [...arr].sort(cmp);
    this.head = new NodeSorted(this.arr[0], undefined, undefined, cmp);
    this.tail = this.head;
    for (let i = 1; i < this.arr.length; i++) {
      this.tail.next = new NodeSorted(this.arr[i], this.tail, undefined, cmp);
      this.tail = this.tail.next;
    }
  }
}
