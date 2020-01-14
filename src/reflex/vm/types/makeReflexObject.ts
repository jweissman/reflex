import ReflexObject from "./ReflexObject";
import { ReflexFunction } from "./ReflexFunction";
import Machine from "../Machine";
import ReflexClass, { NATIVE_CLASSES } from "./ReflexClass";
import { makeMetaclass } from "./makeMetaclass";
import { log } from "../util/log";
export function makeReflexObject(machine: Machine, klass: ReflexClass, args: ReflexObject[]) {
    log("MAKE " + klass.name)
    log("derived? " + (klass.derived ? klass.base.name : 'no'))
    if (klass === ReflexClass.klass) {
        throw new Error("call ReflexClass.make instead of makeReflexObject with Class(Class)...");
    }
    let mu = new ReflexObject();
    if (Object.keys(NATIVE_CLASSES).includes(klass.name)) {
        log("MAKE WITH JS CLASS: " + klass.name)
        let Klass = NATIVE_CLASSES[klass.name];
        if (args[0] instanceof Klass) {//} && (args[0] as ReflexClass).name === klass.name) {
            log("ARG IS ALREADY " + klass.name + ": " + args[0].inspect())
            mu = args.shift() as ReflexObject; //[0];
        } else {
            log("CONSTRUCT " + klass.name + ": " + Klass)
            mu = new Klass(...args);
        }
        mu.set("class", Klass.klass);
    } else if (klass.derived && Object.keys(NATIVE_CLASSES).includes(klass.base.name)) {
        log("MAKE DERIVED JS OBJECT: " + klass.name)
        let Klass = NATIVE_CLASSES[klass.base.name];
        if (args[0] instanceof Klass) {//} && (args[0] as ReflexClass).name === klass.name) {
            log("ARG IS ALREADY " + klass.base.name + ": " + args[0].inspect())
            mu = args.shift() as ReflexObject; //[0];
        } else {
            log("CONSTRUCT " + klass.base.name + ": " + Klass)
            mu = new Klass(...args);
        }
        mu.set("class", klass); //Klass.klass);
    } else {
        log("MAKE PURE REFLEX OBJECT: " + klass.name)
        mu.set("class", klass);
    }
    let instanceMeta = makeMetaclass(mu);
    mu.set("meta", instanceMeta);
    if (mu.respondsTo("init")) {
        log("CALL INIT")
        let init = mu.send('init');
        if (init instanceof ReflexFunction) {
            init.frame.self = mu;
            // log("DO INVOKE INIT " + init + " WITH ARGS: " + args)
            machine.doInvoke(mu, init, ...args);
        }
    } else {
        log("NO INIT")
    }
    log("MADE " + klass.name + ": " + mu.inspect()) 
    return mu;
}
