import ReflexObject from "./ReflexObject";
import { ReflexFunction, WrappedFunction } from "./ReflexFunction";
import { log } from "../Log";

export default class ReflexClass extends ReflexObject {
    static klass = ReflexClass.makeClass("Class", ReflexClass.klass);

    static makeInstance = (klass: ReflexClass) => {
        let mu = new ReflexObject()
        if (klass === ReflexClass.klass) {
            // ReflexClass.makeClass() 
            throw new Error("call makeClass instead")
            // mu = makeClass()
        }
        mu.set("class", klass);
        return mu
    }

    static makeClass(name: string, superclass: ReflexClass = ReflexObject.klass) {
        log("MAKE CLASS " + name + " SUBCLASS OF " + superclass)
        let klass = new ReflexClass(name);
        klass.set("super", superclass);
        klass.set("class", ReflexClass.klass);
        klass.set("instance_methods", new ReflexObject());

        let newFn: Function = () => ReflexClass.makeInstance(klass);
        if (name === 'Class') {
            newFn = (name: string, customSuper?: ReflexClass) =>
                ReflexClass.makeClass(
                    name || 'Anonymous',
                    customSuper || ReflexObject.klass
                );
        }
        klass.set("new", new WrappedFunction(name + '.new', newFn));

        klass.set("defineMethod", new WrappedFunction(`${name}.defineMethod`,
            (name: string, fn: ReflexFunction) => ReflexClass.defineInstanceMethod(klass, fn, name)
        ));
        return klass;
    }

    static defineInstanceMethod = (klass: ReflexClass, fn: ReflexFunction, name: string) => {
        fn.name = `${klass.name}.${name}`
        log("DEFINE INSTANCE METHOD "+ name + " on " + klass.inspect() + " ==== \n   ---> fn: " + fn)
        let methods = klass.get("instance_methods") || new ReflexObject();
        methods.set(name, fn);
        klass.set("instance_methods", methods)
        return fn
    }

    private constructor(public name: string) { super(); } 
    get superclass(): ReflexClass { return this.get("super") as ReflexClass }
    get ancestors(): ReflexClass[] { return this.name === 'Object' ? [] : [ this.superclass, ...this.superclass.ancestors]}
    protected get instanceMethods(): ReflexObject { return this.get("instance_methods") as ReflexObject }
    get displayName() { return `Class(${this.name})` }
}