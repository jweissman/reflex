import ReflexObject from "./ReflexObject";
import { ReflexFunction } from "./ReflexFunction";
import ReflexClass from "./ReflexClass";
export function defineInstanceMethod(klass: ReflexClass, fn: ReflexFunction, name: string) {
    // log("DEFINE INSTANCE METHOD name=" + name + " on " + klass.inspect() + " / ==== \n   ---> fn: " + fn)
    fn.name = `${klass.name}#${name}`;
    if (klass.isMeta) {
        fn.name = klass.preclass instanceof ReflexClass
            ? `${klass.preclass.name}.${name}`
            : `${klass.preclass.klass.name} instance.${name}`;
    }
    let methods = klass.get("instance_methods") || new ReflexObject();
    methods.set(name, fn);
    klass.set("instance_methods", methods);
}
