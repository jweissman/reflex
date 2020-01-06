import ReflexClass, { makeReflexObject, defineInstanceMethod, defineClassMethod } from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction, WrappedFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";
import Machine from "./Machine";
import { log } from "./util/log";

const Class = ReflexClass.klass;
Class.set("class", Class);
const Metaclass = ReflexClass.make("Metaclass", ReflexObject.klass, false)
Metaclass.set("super", Class);
const RObject = ReflexClass.make("Object")
RObject.set("super", RObject);
Class.set("super", RObject);
export const ClassMeta = ReflexClass.make("Meta(Class)", Metaclass, false);
Class.set("meta", ClassMeta);

const ObjectMeta = ReflexClass.make("Meta(Object)", ClassMeta, false);

ClassMeta.set("pre", Class);
ObjectMeta.set("pre", RObject);
Class.set("meta", ClassMeta);
RObject.set("meta", ObjectMeta);
ReflexObject.klass = RObject;

RObject.wireClassMethods();
Class.wireClassMethods()

const RFunction = ReflexClass.make("Function");
ReflexFunction.klass = RFunction;

const Nihil = ReflexClass.make("Nihil");
ReflexNihil.klass = Nihil;

// 
let objectMethods = RObject.get("instance_methods")
objectMethods.set("eq", new WrappedFunction(`Object.eq`,
 (machine: Machine, other: ReflexObject) => machine.boundSelf!.isEqual(other)
));
objectMethods.set("instanceEval", new WrappedFunction(`Object.instanceEval`,
 (machine: Machine, fn: ReflexFunction) => ReflexClass.instanceEval(machine.boundSelf!, machine, fn)

));
objectMethods.set("isInstanceOf", new WrappedFunction(
        `Object.isInstanceOf`,
        (machine: Machine, klass: ReflexClass) => {
          let self = machine.boundSelf!
            let isInstance = self.get("class") === klass ||
                self.get("class").ancestors.find(a => a === klass)
            log("IS " + self.className + " INSTANCE OF " + klass.name + "??? " + isInstance)
            return !!isInstance
        }
    ))

let classMethods = Class.get("instance_methods")
classMethods.set("isAncestorOf", new WrappedFunction(
  `Class.isAncestorOf`,
  (machine: Machine, other: ReflexClass) => other.ancestors.find(o => o === machine.boundSelf!)
));

classMethods.set("defineMethod", new WrappedFunction(`Class.defineMethod`,
  (machine: Machine, name: string, fn: ReflexFunction) => {
    defineInstanceMethod(machine.boundSelf! as ReflexClass, fn, name)
  }
));

classMethods.set("defineClassMethod", new WrappedFunction(`Class.defineClassMethod`,
  (machine: Machine, name: string, fn: ReflexFunction) => {
    defineClassMethod(machine.boundSelf! as ReflexClass, fn, name)
  }
))

let Main = ReflexClass.make("Main")
const constructMain = (machine: Machine) => {
  let main = makeReflexObject(machine, Main, [])
  // Main.set("instance", main); //.set("instance")
  // main.set("defineMethod", new WrappedFunction(`main.defineMethod`,
  //   (_machine: Machine, name: string, fn: ReflexFunction) => {
  //     defineInstanceMethod(main.eigenclass, fn, name)
  //   }
  // ))
  return main;
}

export const bootLocals = {
  Object: RObject,
  Class,
  Function: RFunction,
  Main, 
  Nihil,
  Metaclass,
}

export default constructMain;