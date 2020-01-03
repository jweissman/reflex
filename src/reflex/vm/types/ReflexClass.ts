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
            mu.set("meta", ReflexClass.makeInstanceMetaclass(mu))
            mu.set("instanceEval", new WrappedFunction(
                `PhantomInstanceMeta(${klass.name})#instanceEval`,
                (machine: Machine, fn: ReflexFunction) => ReflexClass.instanceEval(mu, machine, fn)
            ));
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
        klass.set("instanceEval", new WrappedFunction(
            `PhantomInstanceMeta(${klass.name})#instanceEval`,
            (machine: Machine, fn: ReflexFunction) => ReflexClass.instanceEval(klass, machine, fn)
        ));
        klass.set("instance_methods", new ReflexObject());
        let meta;
        if (name.startsWith("Meta(Meta(")) {
            log("Warning: make metametaclass " + name)
            if (superclass) {
                let supermeta = superclass.get("meta") as ReflexClass;
                log("Warning: set meta of metametaclass " + name + " to " + supermeta)
                klass.set("super", supermeta);
                klass.set("meta", supermeta);
            }
            if (wireMethods) { ReflexClass.wireClassMethods(klass); }
        } else if (superclass && superclass.get("meta")) {
            let metaName = `Meta(${name})`
            log("CRAFTING META for " + name + ": " + metaName)
            let supermeta = superclass.get("meta") as ReflexClass;
            log("SUPERMETA" + supermeta)
            meta = ReflexClass.makeClass(`Meta(${name})`, supermeta);
            klass.set("meta", meta);
            meta.set("pre", klass)
            if (wireMethods) { ReflexClass.wireClassMethods(klass); }
        } else {
            log("Warning: no superclass or no meta defined on class " + name)
        }
        
        return klass;
    }

    static makeMetaclass(protoclass: ReflexClass) {
        let meta = ReflexClass.makeClass(`Meta(${protoclass.name})`, protoclass.superclass.eigenclass);
        meta.set("pre", protoclass)
        meta.wireClassMethods()
        return meta;
    }

    static makeInstanceMetaclass(proto: ReflexObject) {
        let meta = ReflexClass.makeClass(`Meta(${proto.klass.name} instance)`, proto.klass.eigenclass);
        meta.set("pre", proto)
        meta.wireClassMethods()
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
    get superclass(): ReflexClass { return this.get("super") as ReflexClass }
    // get eigenclass(): ReflexClass { return this.get("meta") as ReflexClass }
    get ancestors(): ReflexClass[] {
        return this.name === 'Object' || this.name === "Meta(Object)" || this.superclass === undefined ? [] : [ this.superclass, ...this.superclass.ancestors]
    }
    get metaChain(): ReflexClass[] {
        return this.name === 'Object' || this.name === "Meta(Object)" || this.eigenclass === undefined || this.superclass === undefined
            ? []
            : [ this.superclass.eigenclass, ...this.superclass.metaChain ]
    }
    protected get instanceMethods(): ReflexObject { return this.get("instance_methods") as ReflexObject }
    get displayName() { return `Class(${this.name})` }

    send(message: string): ReflexObject {
        log("ReflexClass.send self=" + this.inspect())
        let classMethods = this.eigenclass && this.eigenclass.get("instance_methods")
        let supershared = this.metaChain.map(a => a && a.get("instance_methods")).find(a => a && a.get(message))
        if (classMethods && classMethods.get(message)) {
            log('msg is eigen class_method')
            return classMethods.get(message)
        } else if (supershared && supershared.get(message)) {
            log('msg is eigen-ancestor class_method')
            return supershared.get(message)
        } else if (this.name.match(/Meta\(/) && message === "meta" && !this.eigenclass) {
            log("BUILD META: " + this.name)
            let eigen = ReflexClass.makeMetaclass(this)
            this.set("meta", eigen)
            return this.get("meta")
        } else {
            return super.send(message);
        }
    }
}