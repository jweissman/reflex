import ReflexObject from "./ReflexObject";
import { ReflexFunction } from "./ReflexFunction";
import Machine from "../Machine";
import ReflexClass, { NATIVE_CLASSES } from "./ReflexClass";
import { makeMetaclass } from "./makeMetaclass";
export function makeReflexObject(machine: Machine, klass: ReflexClass, args: ReflexObject[]) {
    if (klass === ReflexClass.klass) {
        throw new Error("call ReflexClass.make instead of makeReflexObject with Class(Class)...");
    }
    let mu = new ReflexObject();
    if (Object.keys(NATIVE_CLASSES).includes(klass.name)) {
        let Klass = NATIVE_CLASSES[klass.name];
        if (args[0] instanceof Klass) {
            mu = args[0];
        }
        else {
            mu = new Klass(...args);
        }
        mu.set("class", Klass.klass);
    }
    else {
        mu.set("class", klass);
    }
    let instanceMeta = makeMetaclass(mu);
    mu.set("meta", instanceMeta);
    if (mu.respondsTo("init")) {
        let init = mu.send('init');
        if (init instanceof ReflexFunction) {
            init.frame.self = mu;
            // log("DO INVOKE INIT " + init + " WITH ARGS: " + args)
            machine.doInvoke(mu, init, ...args);
        }
    }
    return mu;
}
