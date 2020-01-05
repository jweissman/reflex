import ReflexObject from "./ReflexObject";
import { ReflexFunction, WrappedFunction } from "./ReflexFunction";
import Machine from "../Machine";
import { log } from "../util/log";

const NATIVE_CLASSES: { [key: string]: any } = {
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
            let instanceMeta = ReflexClass.makeInstanceMetaclass(mu)
            mu.set("meta", instanceMeta)
            
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

    static makeClass(name: string, superclass: ReflexClass = ReflexObject.klass, wireMethods: boolean = true) {
        log("MAKE CLASS " + name + " SUBCLASS OF " + superclass)
        let klass = new ReflexClass(name);
        klass.set("super", superclass);
        klass.set("class", ReflexClass.klass);
        klass.set("instance_methods", new ReflexObject());
        let meta;
        // if (name.startsWith("Meta(Meta(")) {
            // log("Warning: skipping making metametaclass for now: " + name)
        // } else
        if (superclass && superclass.get("meta")) {
            meta = ReflexClass.makeMetaclass(klass, false)
            klass.set("meta", meta);
            if (wireMethods) { ReflexClass.wireClassMethods(klass); }
        } else {
            log("Warning: no superclass or no meta defined on class " + name)
        }
        return klass;
    }

    static makeMetaclass(protoclass: ReflexClass, wire: boolean = true): ReflexClass{
        let meta = ReflexClass.makeClass(`Meta(${protoclass.name})`, protoclass.superclass.eigenclass);
        meta.set("pre", protoclass)
        if (wire) { meta.wireClassMethods() }
        return meta;
    }

    static makeInstanceMetaclass(proto: ReflexObject) {
        let name = `Meta(${proto.klass.name} instance)`
        let meta = ReflexClass.makeClass(name, proto.klass.eigenclass);
        meta.set("pre", proto)
        meta.get("instance_methods").set("instanceEval", new WrappedFunction(
            `${name}#instanceEval`,
            (machine: Machine, fn: ReflexFunction) => ReflexClass.instanceEval(proto, machine, fn)
        ));
        // proto.set("meta",  meta);
        // ReflexClass.wireClassMethods(proto)
        return meta;
    }

    static wireClassMethods(klass: ReflexClass) {
        let name = klass.name;
        let meta = klass.eigenclass;
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
            if (classMethods.get("new")) {
                log("WARNING: not overriding class methods, already existed on... " + meta)
            } else {
                classMethods.set("new", new WrappedFunction(name + '.new', newFn));
                classMethods.set("defineMethod", new WrappedFunction(`${name}.defineMethod`,
                    (_machine: Machine, name: string, fn: ReflexFunction) => {
                        // debugger;
                        ReflexClass.defineInstanceMethod(klass, fn, name, meta) //name.startsWith("Meta("))
                    }
                ));
                classMethods.set("defineClassMethod", new WrappedFunction(`${name}.defineClassMethod`,
                    (_machine: Machine, name: string, fn: ReflexFunction) =>
                        ReflexClass.defineClassMethod(klass, fn, name)
                ));
                classMethods.set("instanceEval", new WrappedFunction(
                    `${name}.instanceEval`,
                    (machine: Machine, fn: ReflexFunction) => ReflexClass.instanceEval(klass, machine, fn)
                ));
            }
        } else {
            throw new Error("No meta at wire instance methods for " + name + " (super is " + klass.superclass + ")")
        }
    }

    wireClassMethods() { ReflexClass.wireClassMethods(this); }

    static instanceEval(self: ReflexObject, machine: Machine, block: ReflexFunction) {
        log("INSTANCE EVAL " + block + " -- SELF IS " + this)
        block.frame.self = self;
        machine.doInvoke(undefined, block)
    }

    get isMeta() { return this.name.startsWith("Meta(") }
    preclass?: ReflexClass;

    static detachMeta(className: string) {
        let prefix = "Meta("
        let len = prefix.length
        if (className.startsWith(prefix)) {
            return className.slice(len, className.length-1)
        } else {
            return className
        }
    }

    static defineInstanceMethod = (klass: ReflexClass, fn: ReflexFunction, name: string, meta: ReflexClass) => {
        log("DEFINE INSTANCE METHOD name=" + name + " on " + klass.inspect() + " / meta is " + meta + " ==== \n   ---> fn: " + fn)
           // metaclass instance methods 'look like' class methods
        fn.name = klass.isMeta ? `${ReflexClass.detachMeta(klass.name)}.${name}` : `${klass.name}#${name}` 
        let methods = klass.get("instance_methods") || new ReflexObject();
        methods.set(name, fn);
        klass.set("instance_methods", methods)
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
    }
    private constructor(public name: string) { super(); } 

    assembleMeta() {
        if (this.get("meta")) {
            log("asked to assembleMeta but meta already present")
        } else {
        // if (this.superclass) {
            let meta = ReflexClass.makeMetaclass(this, false);
        //    let supermeta = this.superclass.get("meta") as ReflexClass;
        //    log("Warning: set meta of " + name + " to " + supermeta)
        //    this.set("super", supermeta);
           this.set("meta", meta);
        }
        //    if (depth < 20) {
        //        meta.assembleMeta(depth+1);
        //    }
        // }
        ReflexClass.wireClassMethods(this)
    }

    get superclass(): ReflexClass { return this.get("super") as ReflexClass }
    get ancestors(): ReflexClass[] {
        return this.name === 'Object' || this.superclass === undefined ? [] : [this.superclass, ...this.superclass.ancestors]
    }
    get metaChain(): ReflexClass[] {
        this.superclass.assembleMeta()
        let chain = this.name === 'Object' || this.eigenclass === undefined || this.superclass === undefined
            ? []
            : [this.superclass.eigenclass, ...this.superclass.metaChain];
        log("GOT METACHAIN FOR " + this.name + ": " + chain)
        return chain
    }
    protected get instanceMethods(): ReflexObject { return this.get("instance_methods") as ReflexObject }
    get displayName() { return `Class(${this.name})` }

    send(message: string): ReflexObject {
        log("ReflexClass.send self=" + this.inspect())
        if (!this.eigenclass) {
            this.assembleMeta()
        }
        let classMethods = this.eigenclass && this.eigenclass.get("instance_methods")
        // if (!this.superclass.eigenclass) {
        //     this.superclass.assembleMeta()
        // }
        let supershared = this.metaChain.map(a => a && a.get("instance_methods")).find(a => a && a.get(message))
        if (classMethods && classMethods.get(message)) {
            log('msg is eigen class_method')
            return classMethods.get(message)
        } else if (supershared && supershared.get(message)) {
            log('msg is eigen-ancestor class_method')
            return supershared.get(message)
        // } else if (this.name.match(/Meta\(/) && message === "meta" && !this.eigenclass) {
        //     log("BUILD META: " + this.name)
        //     let eigen = ReflexClass.makeMetaclass(this)
        //     this.set("meta", eigen)
        //     return this.get("meta")
        } else {
            return super.send(message);
        }
    }
}