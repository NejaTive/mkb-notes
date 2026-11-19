export class UndoHistory<Op> {
  past: Op[] = []
  future: Op[] = []

  constructor(readonly limit = 50) {
    if (!Number.isInteger(limit) || limit < 1) throw new RangeError('History limit must be a positive integer')
  }

  get canUndo(): boolean {
    return this.past.length > 0
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }

  record(op: Op): void {
    this.past.push(op)
    if (this.past.length > this.limit) this.past.splice(0, this.past.length - this.limit)
    this.future = []
  }

  undo(): Op | undefined {
    const op = this.past.pop()
    if (op !== undefined) this.future.push(op)
    return op
  }

  redo(): Op | undefined {
    const op = this.future.pop()
    if (op !== undefined) this.past.push(op)
    return op
  }

  clear(): void {
    this.past = []
    this.future = []
  }
}
