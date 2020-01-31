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
        this.items[index.value] = value
        return value
    }
    inspect(depth: number=0) { 
        if (depth > 24) { return '[...]'}
        return '[' + this.items.map(it => it.inspect(depth+1)) + ']'
    }
    toString() { return this.inspect() }
}