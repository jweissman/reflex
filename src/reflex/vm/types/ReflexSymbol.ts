import ReflexObject from "./ReflexObject";
import { ReflexString } from "./ReflexString";
export class ReflexSymbol extends ReflexObject {
    value!: string;
    constructor(val: string | ReflexString) {
        super(); 
        if (val instanceof ReflexString) { this.value = val.value; }
        else { this.value = val; }
    }
    inspect() { return ":" + this.value; }
    toString() { return this.inspect(); }
}
