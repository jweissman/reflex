import ReflexObject from "./ReflexObject";

export class ReflexString extends ReflexObject {
    constructor(public value: string) { super(); }
    inspect() { return "'" + this.value + "'"; }
    toString() { return this.inspect()}
//   concat(other: string) {
//       return this.value + other
//   }
}