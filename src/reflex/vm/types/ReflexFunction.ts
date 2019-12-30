import ReflexObject from "./ReflexObject";
import { State } from "../State";
import { Store, Frame } from "../Frame";

interface Binding { state: State }

export class ReflexFunction extends ReflexObject {
    public name?: string;
    public label!: string;
    // public self?: ReflexObject
    public arity!: number
    public params!: string[]
    // public locals: Store = {};
    public frame!: Frame;

    // public binding?: Binding;
    // static klass: ReflexClass;
    // constructor() { //) {
    //     super();
    // }
    inspect() { return this.displayName; }
    get displayName() {
        // return `Function(${this.name}, arity: ${this.arity})`;
        return `Function(${this.name})` //, arity: ${this.arity})`;
    }
}

// a js function
export class WrappedFunction extends ReflexObject {
    constructor(public name: string, public impl: Function) {
        super();
    }

    get displayName() { return `Function(${this.name}[wrap])`; }

    get arity() { return this.impl.length; }
}

// a fn with a pure reflex impl, constructed via Function.new...
// export class ClassicalReflexFunction extends ReflexFunction {
//     constructor(underlyingFn: ReflexFunction) {
//         super(underlyingFn.name, underlyingFn.label, underlyingFn.self);
//     }
// }