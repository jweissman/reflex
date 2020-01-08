import ReflexObject from "./ReflexObject";
import { ReflexFunction, WrappedFunction } from "./ReflexFunction";
import Machine from "../Machine";
import { log } from "../util/log";
import { ReflexNumber } from "../ReflexNumber";

const NATIVE_CLASSES: { [key: string]: any } = {
    "Function": ReflexFunction,
    "Number": ReflexNumber,
}

export const classRegistry: { [key: string]: ReflexClass } = {}

export default class ReflexClass extends ReflexObject {
    isClass: boolean = true;

    static make = (name: string, superclass: ReflexClass = ReflexObject.klass, wireMethods: boolean = true) => {
        // log("MAKE CLASS " + name + " SUBCLASS OF " + superclass)
        let klass = new ReflexClass(name);
        classRegistry[name] = klass;
        klass.set("super", superclass);
        klass.set("class", ReflexClass.klass);
        klass.set("instance_methods", new ReflexObject());
        let meta;
        if (superclass && superclass.get("meta")) {
            meta = makeMetaclass(klass)
            klass.set("meta", meta);
        }
        return klass;
    }

    static klass = ReflexClass.make("Class", ReflexClass.klass, false);

    static instanceEval(self: ReflexObject, machine: Machine, block: ReflexFunction) {
        block.frame.self = self;
        machine.doInvoke(undefined, block)
    }

    get isMeta() { return this.name.startsWith("Meta(") }
    preclass?: ReflexClass;

    private constructor(public name: string) { super(); } 

    assembleMeta() {
        if (this.get("meta")) {
            // log("asked to assembleMeta but meta already present")
        } else {
            let meta = makeMetaclass(this) //, false);
           this.set("meta", meta);
        }
    }

    get superclass(): ReflexClass { return this.get("super") as ReflexClass }
    get ancestors(): ReflexClass[] {
        return this.name === 'Object' || this.superclass === undefined ? [this] : [this.superclass, ...this.superclass.ancestors]
    }
    get metaChain(): ReflexClass[] {
        let chain = this.name === 'Object' || this.eigenclass === undefined || this.superclass === undefined
            ? []
            : [this.superclass.eigenclass, ...this.superclass.metaChain];
        // log("GOT METACHAIN FOR " + this.name + ": " + chain)
        return chain
    }
    protected get instanceMethods(): ReflexObject { return this.get("instance_methods") as ReflexObject }
    get displayName() { return `Class(${this.name})` }

    get messageSources(): ReflexObject[] {
       if (!this.eigenclass) { this.assembleMeta() }
        let self = this;
        let eigen = this.eigenclass.get("instance_methods")
        let shared = this.klass.get("instance_methods")
        let supershared = this.ancestors.map(a => a.get("instance_methods")) //.find(a => a.get(message))
        let supermeta = this.metaChain.flatMap(a => a ? [a.get("instance_methods")] : []) //.find(a => a && a.get(message))
        return [ self, eigen, ...supermeta, shared, ...supershared ]
    }
    // send(message: string): ReflexObject {
    //    return super.send(message);
    // }
    //    let classMethods = this.eigenclass && this.eigenclass.get("instance_methods")
    //    let supermeta = this.metaChain.map(a => a && a.get("instance_methods")).find(a => a && a.get(message))
    //    let shared = this.klass.get("instance_methods")
    //    let supershared = this.ancestors.map(a => a.get("instance_methods")).find(a => a.get(message))
    //    let sources = [ classMethods, supermeta, shared, supershared ]
    //    let source = sources.find(source => source && source.get(message))
    //    if (source) {
    //        let result = source.get(message)
    //        if (result instanceof WrappedFunction) {
    //            let res = result as WrappedFunction;
    //            return res.bind(this);
    //        } else {
    //            return result
    //        }
    //    } else {
    //    }
    //}
}

export const makeReflexObject = (machine: Machine, klass: ReflexClass, args: ReflexObject[]) => {
    if (klass === ReflexClass.klass) { throw new Error("call makeClass instead") }
    let mu = new ReflexObject()
    if (Object.keys(NATIVE_CLASSES).includes(klass.name)) {
        let Klass = NATIVE_CLASSES[klass.name];
        if (args[0] instanceof Klass) { mu = args[0]; }
        else { mu = new Klass(...args); }
        mu.set("class", Klass.klass);
    } else {
        mu.set("class", klass);
    }

    let instanceMeta = makeMetaclass(mu)
    mu.set("meta", instanceMeta)
    if (mu.respondsTo("init")) {
        let init = mu.send('init');
        if (init instanceof ReflexFunction) {
            init.frame.self = mu;
            log("DO INVOKE INIT " + init + " WITH ARGS: " + args)
            machine.doInvoke(mu, init, ...args)
        }
    }
    return mu
}


const detachMeta = (className: string) => {
    let prefix = "Meta("
    let len = prefix.length
    if (className.startsWith(prefix)) {
        return className.slice(len, className.length - 1)
    } else {
        return className
    }
}

export const defineInstanceMethod = (klass: ReflexClass, fn: ReflexFunction, name: string) => {
    log("DEFINE INSTANCE METHOD name=" + name + " on " + klass.inspect() + " / ==== \n   ---> fn: " + fn)
    fn.name = klass.isMeta ? `${detachMeta(klass.name)}.${name}` : `${klass.name}#${name}`
    let methods = klass.get("instance_methods") || new ReflexObject();
    methods.set(name, fn);
    klass.set("instance_methods", methods)
}

export const defineClassMethod = (klass: ReflexClass, fn: ReflexFunction, name: string) => {
    log("DEFINE CLASS METHOD name=" + name);
    log(" on " + klass.inspect() + " ==== \n   ---> fn: " + fn)
    let meta = klass.get("meta")
    if (meta) {
        fn.name = `${klass.name}.${name}`
        klass.eigenclass.get("instance_methods").set(name, fn);
    } else {
        throw new Error("undefined meta at class method def")
    }
}

export const makeMetaclass = (proto: ReflexObject) => {
    let protoclass: ReflexClass = proto.isClass ? proto as ReflexClass : proto.klass
    let name = proto.isClass
        ? `Meta(${protoclass.name})`
        : `Meta(${protoclass.name} instance)`
    let supermeta = proto.isClass ? protoclass.superclass.eigenclass : protoclass.eigenclass
    let meta = ReflexClass.make(name, supermeta);
    meta.set("pre", proto)
    return meta;
}