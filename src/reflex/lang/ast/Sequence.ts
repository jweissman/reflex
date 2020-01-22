import Tree from './Tree';
export class Sequence<T extends Tree> extends Tree {
    constructor(public items: T[]) { super(); }
    get code() { return this.items.flatMap(item => item.code); }
    get length() { return this.items.length; }
    reverse() { return new Sequence(this.items.reverse()); } 
    inspect(): string {
        return this.items.length ? "("+ this.items.map(item => item.inspect()).join(',') +")" : "";
    }
    map<U>(fn: (item: T) => U): U[] {
        return this.items.map(fn)
    }
}
