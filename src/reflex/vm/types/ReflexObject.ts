import ReflexClass from "./ReflexClass";
import { log } from "../util/log";
import Machine from "../Machine";
// import { ReflexFunction, WrappedFunction } from "./ReflexFunction";
class MethodMissing extends Error {}
type Store = {[key: string]: ReflexObject} 
export default class ReflexObject {
    static klass: ReflexClass; // = new ReflexClass("Object");

    protected members: Store = {}

    // constructor() { 
    // }
    assembleMeta() {
    }


    get klass(): ReflexClass { return this.get('class') as ReflexClass }
    get superclass(): ReflexClass { return this.klass.get('super') as ReflexClass }
    get eigenclass(): ReflexClass { return this.get('meta') as ReflexClass }

    get ancestors(): ReflexClass[] {
        // if (this.)
        // console.log("ANCESTORS OF " + this.inspect())
        return [ this.klass, ...this.klass.ancestors]
    }

    set(k: string,v: ReflexObject) { this.members[k] = v }
    get(k: string): ReflexObject { return this.members[k] }

    private surroundingObject: ReflexObject | null = null;
    within(obj: ReflexObject) { this.surroundingObject = obj; return this; }


    send(message: string): ReflexObject {
        log("ReflexObject.send -- " + message + " -- to self: " + this.inspect() + " class: " + this.klass + " super: " + this.superclass);
        let shared = this.klass.get("instance_methods")
        let supershared = this.ancestors.map(a => a.get("instance_methods")).find(a => a.get(message))
        if (message === 'self') {
            log('msg is self')
            return this;
        } else if (this.get(message)) {
            log('msg is raw attribute')
            return this.get(message)
        } else if (shared && shared.get(message)) {
            log('msg is parent instance_method')
            return shared.get(message)
        } else if (supershared && supershared.get(message)) {
            log('msg is ancestor instance_method')
            return supershared.get(message)
        } else {
            if (this.surroundingObject && this.surroundingObject !== this) {
                log('trying on surrounding obj')
                return this.surroundingObject.send(message);
            } else {
                log('meth missing!')
                return this.methodMissing(message);
            }
        }
    }


    methodMissing(message: string): ReflexObject {
        throw new MethodMissing(`Method missing: ${message} on ${this.inspect()}`);
    }

    respondsTo(message: string): boolean {
        log("ReflexObject.respndsTo -- " + message + " -- to self: " + this.inspect() + " class: " + this.klass + " super: " + this.superclass);
        let shared = this.klass.get("instance_methods")
        let supershared = this.ancestors.map(a => a.get("instance_methods")).find(a => a.get(message))
        if (message === 'self') {
            log('msg is self')
            return true //this;
        } else if (this.get(message)) {
            log('msg is raw attribute')
            return true //this.get(message)
        } else if (shared && shared.get(message)) {
            log('msg is parent instance_method')
            return true //shared.get(message)
        } else if (supershared && supershared.get(message)) {
            log('msg is ancestor instance_method')
            return true //supershared.get(message)
        } else {
            if (this.surroundingObject && this.surroundingObject !== this) {
                log('trying on surrounding obj')
                return this.surroundingObject.respondsTo(message);
            } else {
                log('meth missing!')
                return false; //this.methodMissing(message);
            }
        }
        //let shared = this.klass.get("instance_methods")
        //let supershared = this.ancestors.map(a => a.get("instance_methods")).find(a => a.get(message))
        //if (message === 'self') {
        //    return true;
        //} else if (this.get(message)) {
        //    return true;
        //} else if (shared && shared.get(message)) {
        //    return true;
        //} else if (supershared && supershared.get(message)) {
        //    return true;
        //} else {
        //    // if (this instanceof ReflexClass) {
        //        // this.sendClass(message)
        //    if (this.surroundingObject &&
        //        !(this === this.surroundingObject) && 
        //        this.surroundingObject.respondsTo(message)) {
        //        return true;
        //    }
        //}
        //return false;
    }

    get className(): string {return this.klass ? (this.klass as ReflexObject & {name: string}).name : 'Unknown'}
    get displayName(): string { return this.className }

    inspect(): string {
        return this.displayName //+ "(" + util.inspect(this.members) + ")"
    }

    toString() { return this.displayName; }
}