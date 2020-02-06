import ReflexClass from "./ReflexClass";
import { WrappedFunction, ReflexFunction } from "./ReflexFunction";

function uniq<T>(arr: T[]) {
    let u: T[]=[];
    arr.forEach(it => { if (!u.includes(it)) { u.push(it) }})
    return u;
}

export class MethodMissing extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype)
        this.name = MethodMissing.name;
    }
}
type Store = {[key: string]: ReflexObject} 
export default class ReflexObject {
    static klass: ReflexClass;
    static count: number = 0;
    isClass: boolean = false;
    isFacade: boolean = false;
    wrapped: boolean = false;
    id: number = ReflexObject.count++;
    members: Store = {}

    has(k: string) { return Object.keys(this.members).includes(k) }
    set(k: string,v: ReflexObject) { this.members[k] = v }
    get(k: string): ReflexObject { return this.members[k] }

    get self(): ReflexObject { return this; }
    get klass(): ReflexClass { return this.get('class') as ReflexClass }
    get superclass(): ReflexClass { return this.klass.get('super') as ReflexClass }
    get eigenclass(): ReflexClass { return this.get('meta') as ReflexClass }
    get ancestors(): ReflexClass[] { return this.klass ? [ this.klass, ...this.klass.ancestors] : [] }
    get super() { return new SuperFacade(this) }
    get className(): string {
        return this.klass ? (this.klass as {name: string}).name : 'Unknown'
    }
    get displayName(): string { return this.className }
    inspect(): string { return this.displayName }

    toString() { return this.displayName; }
    isEqual(other: ReflexObject): boolean {
        return this.id === other.id
    }

    get messageSources() {
        let eigen = this.eigenclass && this.eigenclass.get("instance_methods")
        let shared = this.klass && this.klass.get("instance_methods")
        let supershared = this.ancestors.flatMap(a => a ? [a.get("instance_methods")] : [])
        return [ eigen, shared, ...supershared ]
    }

    listMethods(): string[] {
        return uniq(this.messageSources.flatMap(source => Object.keys(source.members)))
    }

    send(message: string): ReflexObject {
        if (message === 'self') { return this.self }
        else if (this.isClass === false && message === 'super') { return this.super }
        else {
            let responder = [this, ...this.messageSources].find(source => source && source.has(message))
            if (responder) {
                let response = responder.get(message)
                if (response.wrapped) {
                    let src = response as WrappedFunction
                    if (!src.bound) {
                      return src.bind(this as unknown as ReflexClass)
                    }
                    return src
                }
                if (response.className === 'Function') {
                    (response as ReflexFunction).frame.self = this;
                }
                return response
            }
        }
        // return this.methodMissing(message);
        throw new MethodMissing(`Method missing: ${message} on ${this.inspect()}`);
    }

    // methodMissing(message: string): ReflexObject {
    //     throw new MethodMissing(`Method missing: ${message} on ${this.inspect()}`);
    // }

    respondsTo(message: string): boolean {
        if (message === 'self') { return true }
        else if (this.isClass === false && message === 'super') { return true }
        else {
            let responder = [this, ...this.messageSources].find(source => source && source.has(message))
            if (responder) {
                return true;
            }
        }
        return false;
    }
}

class SuperFacade extends ReflexObject {
    isFacade: boolean = true;
    constructor(public iso: ReflexObject) { super(); }
    get klass() { return this.iso.superclass; }
    get self() {
        if (this.iso.isFacade) {
            return this.iso.self;
        }
        else {
            return this.iso;
        }
    }
    get displayName(): string { return `Super(${this.iso.displayName})`; }
    // should have better tests of this?
    // set(k: string,v: ReflexObject) { this.self.set(k,v) } //members[k] = v }
    has(k: string) {
        return this.self.has(k);
    }
    get(k: string): ReflexObject {
        if (k === "class") {
            return this.klass;
        }
        else {
            return this.self.get(k);
        }
    }
}
