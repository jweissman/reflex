import ReflexObject from "./ReflexObject";
import { ReflexFunction, WrappedFunction } from "./ReflexFunction";
import Machine from "../Machine";
import { log } from "../util/log";

const NATIVE_CLASSES: { [key: string]: any } = {
    // "Object": ReflexObject,
    "Function": ReflexFunction,
}

export default class ReflexClass extends ReflexObject {
    isClass: boolean = true;
    static klass = ReflexClass.makeClass("Class", ReflexClass.klass, false);

    static makeInstance = (machine: Machine, klass: ReflexClass, args: ReflexObject[]) => {
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
                    init.frame.self = mu;
                    machine.doInvoke(mu, init, ...args)
                }
            }
        }
        return mu
    }

    static makeClass(name: string, superclass: ReflexClass = ReflexObject.klass, wireInstanceMethods: boolean = true) {
        log("MAKE CLASS " + name + " SUBCLASS OF " + superclass)
        let klass = new ReflexClass(name);
        // klass.set("name", )
        klass.set("super", superclass);
        klass.set("class", ReflexClass.klass);
        let meta;
        if (!name.startsWith("Meta(") && superclass && superclass.get("meta")) {
            // if (superclass.get("meta").get("name") !== name) {
                let metaName = `Meta(${name})`
                log("CRAFTING META for " + name + ": " + metaName)
                meta = ReflexClass.makeClass(`Meta(${name})`, superclass.get("meta") as ReflexClass);
                klass.set("meta", meta);
            if (wireInstanceMethods) { ReflexClass.wireInstanceMethods(klass); }
            // }
        } else {
            // klass.set("meta", ReflexClass.makeClass(`Meta(${name})`, ))
            // throw new Error("No meta defined on superclass " + name)
            log("Warning: no superclass or no meta defined on class " + name)
        }
        klass.set("instance_methods", new ReflexObject());
        
        return klass;
    }

    static wireInstanceMethods(klass: ReflexClass) {
        let name = klass.name;
        let meta = klass.eigenclass; //get("meta")
        let newFn: Function = (machine: Machine, ...args: ReflexObject[]) => ReflexClass.makeInstance(machine, klass, args);
        if (name === 'Class') {
            newFn = (_machine: Machine, name: string, customSuper?: ReflexClass) =>
                ReflexClass.makeClass(
                    name || 'Anonymous',
                    customSuper || ReflexObject.klass
                );
        }
        if (meta) {
            let classMethods = meta.get("instance_methods");
            classMethods.set("new", new WrappedFunction(name + '.new', newFn));
            classMethods.set("defineMethod", new WrappedFunction(`${name}.defineMethod`,
                (_machine: Machine, name: string, fn: ReflexFunction) => ReflexClass.defineInstanceMethod(klass, fn, name)
            ));
            classMethods.set("defineClassMethod", new WrappedFunction(`${name}.defineClassMethod`,
                (_machine: Machine, name: string, fn: ReflexFunction) => ReflexClass.defineClassMethod(klass, fn, name)
            ));
        } else {
            throw new Error("No meta at wire instance methods for " + name + " (super is " + klass.superclass + ")")
        }
        // return klass;
    }

    wireInstanceMethods() { ReflexClass.wireInstanceMethods(this); }

    static defineInstanceMethod = (klass: ReflexClass, fn: ReflexFunction, name: string) => {
        log("DEFINE INSTANCE METHOD name=" + name + " on " + klass.inspect() + " ==== \n   ---> fn: " + fn)
        fn.name = `${klass.name}#${name}`
        let methods = klass.get("instance_methods") || new ReflexObject();
        methods.set(name, fn);
        klass.set("instance_methods", methods)
        // return fn
    }
    static defineClassMethod = (klass: ReflexClass, fn: ReflexFunction, name: string) => {
        log("DEFINE CLASS METHOD name=" + name + " on " + klass.inspect() + " ==== \n   ---> fn: " + fn)
        let meta = klass.get("meta")
        if (meta) {
            fn.name = `${klass.name}.${name}`
            let methods = klass.get("meta").get("instance_methods") || new ReflexObject();
            methods.set(name, fn);
            klass.get("meta").set("instance_methods", methods)
        } else {
            throw new Error("undefined meta at class method def")
        }
        // return fn
    }
    private constructor(public name: string) { super(); } 
    get superclass(): ReflexClass { return this.get("super") as ReflexClass }
    get eigenclass(): ReflexClass { return this.get("meta") as ReflexClass }
    get ancestors(): ReflexClass[] {
        // console.log("KLASS ANCESTORS FOR " + this.name)
        return this.name === 'Object' || this.name === "Meta(Object)" || this.superclass === undefined ? [] : [ this.superclass, ...this.superclass.ancestors]
    }
    get metaChain(): ReflexClass[] {
        // console.log("METACHAIN FOR " + this.name)
        return this.name === 'Object' || this.name === "Meta(Object)" || this.eigenclass === undefined || this.superclass === undefined
            ? []
            : [ this.superclass.eigenclass, ...this.superclass.metaChain ]
    }
    protected get instanceMethods(): ReflexObject { return this.get("instance_methods") as ReflexObject }
    get displayName() { return `Class(${this.name})` }

    send(message: string): ReflexObject {
        let classMethods = this.eigenclass && this.eigenclass.get("instance_methods")
        let supershared = this.metaChain.map(a => a.get("instance_methods")).find(a => a.get(message))
        // if (this.get(message)) {
        //     log('msg is class_attr')
        //     return this.get(message)
        // } else
        if (classMethods && classMethods.get(message)) {
            log('msg is class_method')
            return classMethods.get(message)
        } else if (supershared && supershared.get(message)) {
            log('msg is ancestor class_method')
            return supershared.get(message)
        } else {
            return super.send(message) //this.methodMissing(message)
        }
    }
}