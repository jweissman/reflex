import ReflexObject from "./ReflexObject";

export class ReflexNumber extends ReflexObject {
  name = 'Number'
  constructor(public value: number) {
    super();
  }
  inspect() { return `${this.displayName}(${this.value})`; }
  toString() { return this.value.toString(); }
}

// export class ReflexFloat extends ReflexNumber { name='Float' }
// export class ReflexInteger extends ReflexNumber { name='Integer' }

export class IndeterminateForm extends ReflexNumber {
  name = 'Indeterminate';
  toString() { return this.displayName; }
}

export class PositiveInfinity extends ReflexNumber {
  name = 'PositiveApeiron';
  value = Infinity;
  toString() { return this.displayName; }
}
export class NegativeInfinity extends ReflexNumber {
  name = 'NegativeApeiron';
  value = -Infinity;
  toString() { return this.displayName; }
}