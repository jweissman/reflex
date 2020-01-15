export class Stone {
  constructor(public name: string) { }
  toString() { return '.' } // `__${this.name}__`; }
}
