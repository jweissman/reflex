import ReflexObject from "./ReflexObject";

export class ReflexNumber extends ReflexObject {
  name = 'Number'
  constructor(public value: number) {
    super();
  }
  inspect() { return `${this.displayName}(${this.value})`; }
  toString() { return this.value.toString(); }
}

// our mapping for nan
export class IndeterminateForm extends ReflexNumber {
  name = 'Indeterminate';
  toString() { return this.displayName; }
  // inspect() { return 'Indeterminate'; }
}

// export class Infinity extends ReflexObject {}
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