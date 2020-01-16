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
        if (this.name && this.name.match(/lambda/) && this.source && this.source.length < 60) {
            return this.source
        } else if (this.name) {
            return this.name; //`${this.name}`
        } else {
            throw new Error("function without name / source?")
            // return 'anonymous-fn?'
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

    get displayName() { return this.name; } //`Function(${this.name})`; }

    get isClassMethod() {
        if (this.name.indexOf('.') === -1) {
            return false
        }
        return true
    }

    get delimiter() {
        if (this.isClassMethod) {
            return ('.')
        } else {
            return ('#')
        }
    }

    get nameParts() {
        return this.name.split(this.delimiter)
    }

    bind(self: ReflexObject) {
        let mu = new WrappedFunction(self.displayName + this.delimiter + this.nameParts[1], this.impl, this.convertArgs);
        mu.bound = true;
        mu.boundSelf = self;
        return mu;
    }
}