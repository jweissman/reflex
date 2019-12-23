import ReflexObject from "./ReflexObject";
import { ReflexFunction, WrappedFunction } from "./ReflexFunction";

export default class ReflexClass extends ReflexObject {
    static klass = new ReflexClass("Class");

    static makeClassInstance = (klass: ReflexClass, name: string = 'Anonymous') => {
        // console.log("!!! told to make class instance...")
        let mu = ReflexClass.assemble(name, klass);
        // mu.set("super", klass)
        // mu.set("class", ReflexClass.klass)
        return mu;
    }

    static makeInstance = (klass: ReflexClass) => {
        // console.log("MAKE INSTANCE", { klass })
        let mu = new ReflexObject()
        if (klass === ReflexClass.klass) {
            throw new Error("call makeClassInstance instead")
        } else {
            // console.log("told to make normal object instance...")
        }
        mu.set("class", klass);
        // console.log("MADE INSTANCE", { mu: mu.inspect() })
        // mu.send(initialize)...
        return mu
    }

    static assemble(name: string, superclass: ReflexClass = ReflexObject.klass) {
        let klass = new ReflexClass(name);
        klass.set("super", superclass);
        klass.set("class", ReflexClass.klass);
        klass.set("new", new WrappedFunction(`${name}.new`, () => ReflexClass.makeInstance(klass)));
        return klass;
    }

    constructor(public name: string = 'Anonymous', public theSuper: ReflexClass = ReflexObject.klass) {
        super();
        this.set("build", new WrappedFunction(`${name}.build`, (name?: string) => ReflexClass.makeClassInstance(this, name)));
    }

    protected get superclass(): ReflexClass { return this.get("super") as ReflexClass }
    // inspect() { return this.displayName }
    get displayName() { return `Class(${this.name})` }
}