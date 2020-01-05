import ReflexClass from "./ReflexClass";
import { debug } from "../util/log";

class MethodMissing extends Error {}
type Store = {[key: string]: ReflexObject} 
export default class ReflexObject {
    static klass: ReflexClass;
    protected isClass: boolean = false;
    isFacade: boolean = false;
    protected members: Store = {}

    get self(): ReflexObject { return this; } //.get("self")}
    get klass(): ReflexClass { return this.get('class') as ReflexClass }
    get superclass(): ReflexClass { return this.klass.get('super') as ReflexClass }
    get eigenclass(): ReflexClass { return this.get('meta') as ReflexClass }
    get ancestors(): ReflexClass[] { return [ this.klass, ...this.klass.ancestors] }
    get super() {
        // phantom super instance
        // throw new Error("ReflexObject#super not impl")
        return new SuperFacade(this)
    }

    set(k: string,v: ReflexObject) { this.members[k] = v }
    get(k: string): ReflexObject { return this.members[k] }

    private surroundingObject: ReflexObject | null = null;
    within(obj: ReflexObject) { this.surroundingObject = obj; return this; }

    send(message: string): ReflexObject {
        debug("ReflexObject.send -- " + message + "-- to self: " + this.inspect() + " class: " + this.klass + " super: " + this.superclass);
        let eigen = this.eigenclass && this.eigenclass.get("instance_methods")
        let shared = this.klass.get("instance_methods")
        let supershared = this.ancestors.map(a => a.get("instance_methods")).find(a => a.get(message))
        if (message === 'self') {
            // log('msg is self')
            return this.self;
        } else if (this.isClass === false && message === 'super') {
            // log('msg is super') // provide super facade
            return this.super;
        } else if (this.get(message)) {
            // log('msg is raw attribute')
            return this.get(message)
        } else if (eigen && eigen.get(message)) {
            // log('msg is own eigen attribute')
            return eigen.get(message)
        } else if (shared && shared.get(message)) {
            // log('msg is parent instance_method')
            return shared.get(message)
        } else if (supershared && supershared.get(message)) {
            // log('msg is ancestor instance_method')
            return supershared.get(message)
        } else {
            if (this.surroundingObject && this.surroundingObject !== this) {
                // log('trying on surrounding obj')
                return this.surroundingObject.send(message);
            } else {
                // log('meth missing!')
                return this.methodMissing(message);
            }
        }
    }


    methodMissing(message: string): ReflexObject {
        throw new MethodMissing(`Method missing: ${message} on ${this.inspect()}`);
    }

    respondsTo(message: string): boolean {
        // log("ReflexObject.respondsTo -- " + message + " -- on self: " + this.inspect() + " class: " + this.klass + " super: " + this.superclass);
        let shared = this.klass.get("instance_methods")
        let supershared = this.ancestors.map(a => a.get("instance_methods")).find(a => a.get(message))
        if (message === 'self') {
            // log('msg is self')
            return true //this;
        } else if (message === 'super') {
            // log('msg is super')
            return true
        } else if (this.get(message)) {
            // log('msg is raw attribute')
            return true //this.get(message)
        } else if (shared && shared.get(message)) {
            // log('msg is parent instance_method')
            return true //shared.get(message)
        } else if (supershared && supershared.get(message)) {
            // log('msg is ancestor instance_method')
            return true //supershared.get(message)
        } else {
            if (this.surroundingObject && this.surroundingObject !== this) {
                // log('trying on surrounding obj')
                return this.surroundingObject.respondsTo(message);
            } else {
                // log('meth missing!')
                return false; //this.methodMissing(message);
            }
        }
    }

    get className(): string {return this.klass ? (this.klass as ReflexObject & {name: string}).name : 'Unknown'}
    get displayName(): string { return this.className }

    inspect(): string {
        return this.displayName
    }

    toString() { return this.displayName; }
}

class SuperFacade extends ReflexObject {
    isFacade: boolean = true
    constructor(public iso: ReflexObject) { super(); }
    get klass() { return this.iso.superclass; }
    get self() { 
        if (this.iso.isFacade) {
            return this.iso.self;
        } else {
            return this.iso
        }
    }
    get displayName(): string { return `Super(${this.iso.displayName})`; }

    set(k: string,v: ReflexObject) { this.self.set(k,v) } //members[k] = v }
    get(k: string): ReflexObject {
        if (k === "class") {
            return this.klass;
        } else {
            return this.self.get(k)
        }
    } // members[k] }

}