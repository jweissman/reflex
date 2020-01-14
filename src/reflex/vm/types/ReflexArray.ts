import ReflexObject from "./ReflexObject"
import { ReflexNumber } from './ReflexNumber';

export class ReflexArray extends ReflexObject {
    name='Array'
    items: ReflexObject[] = []
    constructor(...list: ReflexObject[]) {
        super();
        this.items = list;
    }

    at(index: number) {
        let val = this.items[index]
        return val || null
    }

    put(index: ReflexNumber, value: ReflexObject) {
        this.items[index.value] = value
        return value
    }
    inspect() { return '[' + this.items.map(it => it.toString()) + ']' }
    toString() { return this.inspect() }
}