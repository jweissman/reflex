import ReflexObject from "./ReflexObject";
import { ReflexFunction } from "./ReflexFunction";
import Machine from "../Machine";
import { ReflexNumber, IndeterminateForm, NegativeInfinity, PositiveInfinity } from "./ReflexNumber";
import { makeMetaclass } from "./makeMetaclass";
import { ReflexArray } from './ReflexArray';
import { ReflexString } from './ReflexString';
import { ReflexSymbol } from "./ReflexSymbol";

export const NATIVE_CLASSES: { [key: string]: any } = {
    "Function": ReflexFunction,
    "Number": ReflexNumber,
    "String": ReflexString,
    "Symbol": ReflexSymbol,
    "Array": ReflexArray,
    "Indeterminate": IndeterminateForm,
    "NegativeApeiron": NegativeInfinity,
    "PositiveApeiron": PositiveInfinity,
}

export const classRegistry: { [key: string]: ReflexClass } = {}

export default class ReflexClass extends ReflexObject {
    isClass: boolean = true;

    static make = (name: string, superclass: ReflexClass = ReflexObject.klass) => {
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

    static klass = ReflexClass.make("Class", ReflexObject.klass);

    static instanceEval(self: ReflexObject, machine: Machine, block: ReflexFunction) {
        block.frame.self = self;
        machine.doInvoke(undefined, block)
    }

    get isMeta() { return this.name.startsWith("Meta(") }
    get preclass() { return this.get('pre') } 

    private constructor(public name: string) { super(); } 

    assembleMeta() {
        if (!this.get("meta")) {
           let meta = makeMetaclass(this)
           this.set("meta", meta);
        }
    }

    get superclass(): ReflexClass { return this.get("super") as ReflexClass }
    get ancestors(): ReflexClass[] {
        return this === ReflexObject.klass
            ? [this]
            : [this.superclass, ...this.superclass.ancestors]
    }
    get metaChain(): ReflexClass[] {
        let chain = this === ReflexObject.klass
            ? []
            : [this.superclass.eigenclass, ...this.superclass.metaChain];
        return chain
    }
    protected get instanceMethods(): ReflexObject { return this.get("instance_methods") as ReflexObject }
    get displayName() { return `Class(${this.name})` }
    get derived() { return this.superclass.name !== ReflexObject.klass.name }
    get base() {
        if (!this.derived) {
            throw new Error("only derived classes have base classes")
        } else {
            return this.ancestors[this.ancestors.length - 3]
        }
    }

    get messageSources(): ReflexObject[] {
       if (!this.eigenclass) { this.assembleMeta() }
        let eigen = this.eigenclass.get("instance_methods")
        let shared = this.klass.get("instance_methods")
        let supershared = this.ancestors.map(a => a.get("instance_methods"))
        let supermeta = this.metaChain.flatMap(a => a ? [a.get("instance_methods")] : [])
        let sources = [  eigen, ...supermeta, shared, ...supershared ]
        return sources;
    }
}