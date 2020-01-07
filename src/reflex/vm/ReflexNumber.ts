import ReflexObject from "./types/ReflexObject";
export class ReflexNumber extends ReflexObject {
  constructor(public value: number) {
    super();
  }
  inspect() { return `${this.displayName}(${this.value})`; }
  toString() { return this.value.toString(); }
}
