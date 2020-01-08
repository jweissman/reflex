import { ReflexFunction } from "./ReflexFunction";
import ReflexClass from "./ReflexClass";
export function defineClassMethod(klass: ReflexClass, fn: ReflexFunction, name: string) {
    // log("DEFINE CLASS METHOD name=" + name);
    // log(" on " + klass.inspect() + " ==== \n   ---> fn: " + fn)
    let meta = klass.get("meta");
    if (meta) {
        fn.name = `${klass.name}.${name}`;
        klass.eigenclass.get("instance_methods").set(name, fn);
    }
    else {
        throw new Error("undefined meta at class method def");
    }
}
