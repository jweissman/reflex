import ReflexObject from "./ReflexObject";
export class ReflexFunction extends ReflexObject {
    constructor(public name: string, public label: string, public self?: ReflexObject) {
        super();
    }
    inspect() { return this.displayName; }
    get displayName() { return `Function(${this.name})`; }
}

export class WrappedFunction extends ReflexObject {
    constructor(public name: string, public impl: Function) {
        super();
    }

    get displayName() { return `Function(${this.name}[wrap])`; }
}