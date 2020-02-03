import ReflexObject from "./ReflexObject"
import { ReflexNumber } from './ReflexNumber';

export class ReflexArray extends ReflexObject {
    name='Array'
    items: ReflexObject[] = []
    constructor(...list: ReflexObject[]) {
        super();
        this.items = [...list]; //.reverse();
    }

    at(index: number) {
        let val = this.items[index]
        return val || null
    }

    put(index: ReflexNumber, value: ReflexObject) {
        // console.log("ARRAY PUT -- " + value.inspect() + " at " + index.value + " [self before: " + this.inspect() + "]")
        if (value === this) {
            throw new Error("array self-insertion -- probably an error?")
        }
        this.items[index.value] = value
        // console.log("ARRAY PUT -- " + value.inspect() + " at " + index.value + " [self after: " + this.inspect() + "]")
        return true
    }
    inspect(depth: number=0) { 
        if (depth > 24) { return '[...]'}
        return '[' + this.items.map(it => it.inspect(depth+1)) + ']'
    }
    toString() { return this.inspect() }
}