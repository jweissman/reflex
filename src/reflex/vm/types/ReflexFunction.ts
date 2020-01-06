import ReflexObject from "./ReflexObject";
import { Frame } from "../Frame";

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
    boundSelf?: any;
    constructor(public name: string, public impl: Function) {
        super();
    }

    get displayName() { return `Function(${this.name}[wrap])`; }

    get arity() { return this.impl.length; }
}