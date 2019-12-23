import ReflexClass from "./ReflexClass";
class MethodMissing extends Error {}
type Store = {[key: string]: ReflexObject} 
export default class ReflexObject {
    static klass: ReflexClass; // = new ReflexClass("Object");
    protected members: Store = {}

    get klass() { return this.members['class']; }
    // get super() { return this.members['super']; }
    set(k: string,v: ReflexObject) {
        // try {console.log("MEMBER SET", { k,v,self:this.displayName})} catch(e) {}
        this.members[k] = v
    }
    get(k: string): ReflexObject { return this.members[k] }

    send(message: string): ReflexObject {
        // console.log("ReflexObject.send -- " + message + " -- to self: " + this.inspect());
        // let shared: Store = this.klass
        // let meta: Store = this.super.members
        if (message === 'self') {
            return this;
        } else if (this.get(message)) {
            return this.get(message)
        // } else if (shared.get(message)) {
            // return shared.get(message)
        } else {
            return this.methodMissing(message);
        }
    }

    methodMissing(message: string): ReflexObject { throw new MethodMissing(`Method missing: ${message} on ${this.inspect()}`); }

    get className(): string {return (this.klass as ReflexObject & {name: string}).name}
    get displayName(): string { return this.className }

    inspect(deep: boolean=false): string {
        let display = (v: ReflexObject) => {
            try {
                if (deep) {
                    return v === this ? this.displayName : v.inspect(false)
                } else {
                    return v.displayName
                }
            } catch { return "..." }
        }
        let members: string = Object.entries(this.members).map(([k,v]) => `${k}:${display(v)}`).join(", ")
        return this.displayName + "(" + members + ")"
    }

    toString() { return this.displayName; }
}