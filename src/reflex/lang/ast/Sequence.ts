import Tree from './Tree';
export class Sequence extends Tree {
    constructor(public items: Tree[]) { super(); }
    get code() { return this.items.flatMap(item => item.code); }
    get length() { return this.items.length; }
    reverse() { return new Sequence([...this.items].reverse()); } 
    inspect(): string {
        return "("+ this.items.map(item => item.inspect()).join(',') +")";
    }
    map<T>(fn: (item: Tree) => T): T[] {
        return this.items.map(fn)
    }
}
