import assert from "assert";

export class Node<T> {
  constructor(public value: T, public prev?: Node<T>, public next?: Node<T>) {}

  append(node: Node<T>) {
    node.prev = this;
    node.next = this.next;
    if (this.next) this.next.prev = node;
    this.next = node;
  }

  prepend(node: Node<T>) {
    node.prev = this.prev;
    node.next = this;
    if (this.prev) this.prev.next = node;
    this.prev = node;
  }
}

function debug(...args: any[]) {
  return;
  console.log(...args);
}

export class LinkedList<T> {
  static fromArray<T>(arr: T[], compare: (a: T, b: T) => number) {
    const list = new LinkedList<T>(undefined, undefined, compare);
    let prev: Node<T> | undefined;
    if (compare) arr.sort(compare);
    for (const value of arr) {
      const node = new Node<T>(value, prev);
      list.set.add(value);
      if (prev) prev.next = node;
      list.tail = node;
      if (!list.head) list.head = node;
      prev = node;
    }
    return list;
  }

  private set: Set<T> = new Set();

  constructor(
    public head?: Node<T>,
    public tail?: Node<T>,
    public compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)
  ) {}

  has(value: T) {
    return this.set.has(value);
  }

  find(value: T) {
    let node = this.head;
    while (node) {
      if (node.value === value) return node;
      node = node.next;
    }
  }

  remove(value: T) {
    let node = this.head;
    while (node) {
      if (node.value === value) {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        if (node === this.head) this.head = node.next;
        if (node === this.tail) this.tail = node.prev;
        this.set.delete(value);
        return node;
      }
      node = node.next;
    }
  }

  shift() {
    this.assertSorted();
    if (!this.head) return;
    const oldHead = this.head;
    this.head = oldHead.next;
    if (this.head) this.head.prev = undefined;
    else this.tail = undefined; // Ensure tail is updated if list becomes empty
    debug("shift", oldHead.value.toString());
    this.assertSorted();
    this.set.delete(oldHead.value);
    return oldHead;
  }

  pop() {
    if (!this.tail) return;
    const node = this.tail;
    this.tail = node.prev;
    if (this.tail) this.tail.next = undefined;
    else this.head = undefined; // Ensure head is updated if list becomes empty
    debug("pop", node.value.toString());
    this.set.delete(node.value);
    return node;
  }

  push(value: T) {
    this.set.add(value);
    this.assertSorted();
    if (this.tail) {
      const newTail = new Node(value, this.tail);
      const oldTail = this.tail;
      oldTail.next = newTail;
      this.tail = newTail;
      assert(newTail.prev === oldTail);
      assert(newTail.next === undefined);
      assert(this.tail === newTail);
      assert(oldTail.next === newTail);
    } else {
      this.head = this.tail = new Node(value);
    }
    this.assertSorted();
  }

  assertSorted() {
    return;
    const uniq = new Set<T>();
    let node = this.head;
    while (node && node.next) {
      if (uniq.has(node.value)) {
        throw new Error("Not unique");
      }
      uniq.add(node.value);
      if (this.compare(node.value, node.next.value) > 0) {
        console.log(node.value, node.next.value);
        throw new Error("Not sorted");
      }
      node = node.next;
    }
  }

  pushSorted(value: T) {
    let node = this.head;
    while (node && this.compare(node.value, value) < 0) {
      node = node.next;
    }
    this.assertSorted();
    if (node) {
      this.set.add(value);
      debug(
        "pushSorted prepending",
        value.toString(),
        "to",
        node.value.toString()
      );
      const newNode = new Node(value, node.prev, node);
      if (node.prev) node.prev.next = newNode;
      node.prev = newNode;
      if (node === this.head) this.head = newNode;
      this.assertSorted();
    } else {
      debug("pushSorted push", value.toString());
      this.push(value);
      this.assertSorted();
    }
  }
}

// const ll = LinkedList.fromArray(
//   [10, 30, 20, 50, 90, 70, 60, 80, 40, 100],
//   (a, b) => a - b
// );
// function print(list: LinkedList<number>) {
//   let n = list.head;
//   let i = 0;
//   console.log("---");
//   while (n) {
//     console.log(`${i++}: ${n.value}`);
//     n = n.next;
//   }
// }

// print(ll);
// ll.pushSorted(11);
// print(ll);
// ll.shift();
// ll.shift();
// print(ll);
// ll.pushSorted(4);
// print(ll);
