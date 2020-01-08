import ReflexObject from "./ReflexObject";
export class ReflexNumber extends ReflexObject {
    name = 'Number';
  constructor(public value: number) {
    super();
  }
  inspect() { return `${this.displayName}(${this.value})`; }
  toString() { return this.value.toString(); }
}
