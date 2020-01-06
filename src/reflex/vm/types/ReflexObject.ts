import ReflexClass from "./ReflexClass";
import { debug, log } from "../util/log";
import { WrappedFunction } from "./ReflexFunction";

class MethodMissing extends Error {}
type Store = {[key: string]: ReflexObject} 
export default class ReflexObject {
    static klass: ReflexClass;
    static count: number = 0;
    isClass: boolean = false;
    isFacade: boolean = false;
    protected members: Store = {}
    wrapped: boolean = false;
    id: number = ReflexObject.count++;

    set(k: string,v: ReflexObject) { this.members[k] = v }
    get(k: string): ReflexObject { return this.members[k] }

    private surroundingObject: ReflexObject | null = null;
    within(obj: ReflexObject) { this.surroundingObject = obj; return this; }

    get self(): ReflexObject { return this; }
    get klass(): ReflexClass { return this.get('class') as ReflexClass }
    get superclass(): ReflexClass { return this.klass.get('super') as ReflexClass }
    get eigenclass(): ReflexClass { return this.get('meta') as ReflexClass }
    get ancestors(): ReflexClass[] { return [ this.klass, ...this.klass.ancestors] }
    get super() { return new SuperFacade(this) }
    get className(): string {return this.klass ? (this.klass as ReflexObject & {name: string}).name : 'Unknown'}
    get displayName(): string { return this.className }
    inspect(): string { return this.displayName }
    toString() { return this.displayName; }
    isEqual(other: ReflexObject): boolean {
        log("IS EQ: " + other + " / " + this)
        return this.id === other.id
    }

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
        } else if (eigen.get(message) || shared.get(message) || (supershared && supershared.get(message))) { //eigen || shared || supershared) { //} && eigen.get(message)) {
            let source = eigen.get(message) || shared.get(message) || (supershared && supershared.get(message))
            if (source.wrapped) {
                let src = source as WrappedFunction //ReflexObject & { boundSelf: ReflexObject };
                return src.bind(this) //boundSelf = this;
            }
            return source
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
        let eigen = this.eigenclass && this.eigenclass.get("instance_methods")
        let shared = this.klass.get("instance_methods")
        let supershared = this.ancestors.map(a => a.get("instance_methods")).find(a => a.get(message))
        if (message === 'self') {
            return true;
        } else if (this.isClass === false && message === 'super') {
            return true;
        } else if (this.get(message)) {
            return true
        } else if (eigen.get(message) || shared.get(message) || (supershared && supershared.get(message))) { //eigen || shared || supershared) { //} && eigen.get(message)) {
            return true
        } else {
            if (this.surroundingObject && this.surroundingObject !== this) {
                return this.surroundingObject.respondsTo(message);
            } else {
                return false
            }
        }
    }
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

    // should have better tests of this?
    // set(k: string,v: ReflexObject) { this.self.set(k,v) } //members[k] = v }
    get(k: string): ReflexObject {
        if (k === "class") {
            return this.klass;
        } else {
            return this.self.get(k)
        }
    }

}