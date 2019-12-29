import ReflexObject from "./ReflexObject";
import { ReflexFunction, WrappedFunction } from "./ReflexFunction";
import Machine from "../Machine";

const NATIVE_CLASSES: { [key: string]: any } = {
    // "Object": ReflexObject,
    "Function": ReflexFunction,
}

export default class ReflexClass extends ReflexObject {
    static klass = ReflexClass.makeClass("Class", ReflexClass.klass);

    static makeInstance = (meta: Machine, klass: ReflexClass, args: ReflexObject[]) => {
        if (klass === ReflexClass.klass) { throw new Error("call makeClass instead") }
        let mu = new ReflexObject()
        if (Object.keys(NATIVE_CLASSES).includes(klass.name)) {
            let Klass = NATIVE_CLASSES[klass.name];
            mu = args[0] || new Klass();
            mu.set("class", Klass.klass);
        } else {
            mu.set("class", klass);
            if (mu.respondsTo("init")) {
                let init = mu.send('init');
                if (init instanceof ReflexFunction) {
                    init.self = mu;
                    meta.doInvoke(mu, init, ...args)
                }
            }
        }
        return mu
    }

    static makeClass(name: string, superclass: ReflexClass = ReflexObject.klass) {
        // log("MAKE CLASS " + name + " SUBCLASS OF " + superclass)
        let klass = new ReflexClass(name);
        klass.set("super", superclass);
        klass.set("class", ReflexClass.klass);
        klass.set("instance_methods", new ReflexObject());

        let newFn: Function = (meta: Machine, ...args: ReflexObject[]) => ReflexClass.makeInstance(meta, klass, args);
        if (name === 'Class') {
            newFn = (meta: Machine, name: string, customSuper?: ReflexClass) =>
                ReflexClass.makeClass(
                    name || 'Anonymous',
                    customSuper || ReflexObject.klass
                );
        }
        klass.set("new", new WrappedFunction(name + '.new', newFn));

        klass.set("defineMethod", new WrappedFunction(`${name}.defineMethod`,
            (_meta: Machine, name: string, fn: ReflexFunction) => ReflexClass.defineInstanceMethod(klass, fn, name)
        ));
        return klass;
    }

    static defineInstanceMethod = (klass: ReflexClass, fn: ReflexFunction, name: string) => {
        // log("DEFINE INSTANCE METHOD name="+ name + " on " + klass.inspect() + " ==== \n   ---> fn: " + fn)
        fn.name = `${klass.name}.${name}`
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