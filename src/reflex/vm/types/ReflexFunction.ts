import ReflexObject from "./ReflexObject";
import { Frame } from "../Frame";
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
            return this.source
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
    constructor(public name: string, public impl: Function, public convertArgs: boolean = true) {
        super();
    }

    get displayName() { return `Function(${this.name})`; }

    bind(self: ReflexObject) {
        let mu = new WrappedFunction(self.displayName + "." + this.name.split('.')[1], this.impl, this.convertArgs);
        mu.bound = true;
        mu.boundSelf = self;
        return mu;
    }
}