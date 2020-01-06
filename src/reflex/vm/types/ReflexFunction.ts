import ReflexObject from "./ReflexObject";
import { Frame } from "../Frame";
import { log } from "../util/log";
import ReflexClass from "./ReflexClass";

export class ReflexFunction extends ReflexObject {
    public name?: string;
    public label!: string;
    public arity!: number
    public params!: string[]
    public frame!: Frame;
    public blockParamName?: string;
    public source?: string;

    inspect() { return this.displayName; }
    get displayName() {
        if (this.name && this.name.match(/lambda/) && this.source) {
            return `Function(${this.source})`
        } else {
            return `Function(${this.name})`
        }
    }
}

// a js function
export class WrappedFunction extends ReflexObject {
    wrapped = true;
    bound = false;
    boundSelf?: ReflexObject;
    constructor(public name: string, public impl: Function) {
        super();
    }

    get displayName() { return `Function(${this.name}[wrap])`; }

    get arity() { return this.impl.length; }

    bind(self: ReflexClass) {
        log("BIND WRAPPED FN " + this.name + " TO " + self.inspect());
        let mu = new WrappedFunction(self.name + "." + this.name.split('.')[1], this.impl);
        mu.bound = true;
        mu.boundSelf = self;
        return mu;
    }
}

// export class BoundFunction extends WrappedFunction {
//     bound = true;
//     // wrapped = true;
//     private boundSelf?: any;
//     constructor(public fn: WrappedFunction, public self: ReflexObject) {
//         super();
//     }

//     get displayName() { return `Function(${this.name}[wrap])`; }
//     get arity() { return this.impl.length; }
// }