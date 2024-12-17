export class MinHeap<T> {
  private heap: T[];
  private compare: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.heap = [];
    this.compare = compareFn;
  }

  // Build heap from initial array
  buildHeap(arr: T[]): void {
    this.heap = arr;
    for (let i = Math.floor(this.size() / 2) - 1; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  // Get the smallest element (min-heap root)
  peek(): T | undefined {
    return this.heap[0];
  }

  // Update an element and restore heap order
  update(index: number, value: T): void {
    const oldValue = this.heap[index];
    this.heap[index] = value;
    if (this.compare(value, oldValue) < 0) {
      this.heapifyUp(index);
    } else {
      this.heapifyDown(index);
    }
  }

  // Heapify up to restore the heap property
  private heapifyUp(index: number): void {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      if (this.compare(this.heap[currentIndex], this.heap[parentIndex]) < 0) {
        this.swap(currentIndex, parentIndex);
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  // Heapify down to restore the heap property
  private heapifyDown(index: number): void {
    let currentIndex = index;
    const size = this.size();
    while (true) {
      const leftChild = 2 * currentIndex + 1;
      const rightChild = 2 * currentIndex + 2;
      let smallest = currentIndex;

      if (
        leftChild < size &&
        this.compare(this.heap[leftChild], this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < size &&
        this.compare(this.heap[rightChild], this.heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      if (smallest !== currentIndex) {
        this.swap(currentIndex, smallest);
        currentIndex = smallest;
      } else {
        break;
      }
    }
  }

  // Swap two elements in the heap
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Get the current size of the heap
  size(): number {
    return this.heap.length;
  }
}

// Example Usage
const data = [10, 20, 5, 6, 12, 30, 7, 17];
const minHeap = new MinHeap<number>((a, b) => a - b);
minHeap.buildHeap(data);

console.log("Initial Min-Heap:", data);

// Update value at index 2 (5 -> 3)
minHeap.update(2, 3);
console.log("After Updating Index 2 to 3:", data);

// Get the smallest element
console.log("Smallest Element:", minHeap.peek());
