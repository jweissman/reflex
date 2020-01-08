import ReflexClass, { makeReflexObject, defineInstanceMethod, defineClassMethod } from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction, WrappedFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";
import Machine from "./Machine";
import { log } from "./util/log";
import { ReflexNumber } from "./ReflexNumber";

const Class = ReflexClass.klass;
Class.set("class", Class);
const Metaclass = ReflexClass.make("Metaclass", ReflexObject.klass, false)
Metaclass.set("super", Class);
const RObject = ReflexClass.make("Object")
RObject.set("super", RObject);
Class.set("super", RObject);
// export const ClassMeta = ReflexClass.make("Meta(Class)", Metaclass, false);
Class.set("meta", Metaclass);

const ObjectMeta = ReflexClass.make("Meta(Object)", Metaclass, false);

Metaclass.set("pre", Class);
ObjectMeta.set("pre", RObject);
Class.set("meta", Metaclass);
RObject.set("meta", ObjectMeta);
ReflexObject.klass = RObject;

const RFunction = ReflexClass.make("Function");
ReflexFunction.klass = RFunction;

const Nihil = ReflexClass.make("Nihil");
ReflexNihil.klass = Nihil;

export const RNumber = ReflexClass.make("Number");
ReflexNumber.klass = RNumber;
let numberMethods = RNumber.get("instance_methods");
numberMethods.set("add", new WrappedFunction("Number.add",
  (machine: Machine, other: ReflexNumber) => {
    let left =  (machine.boundSelf! as ReflexNumber).value 
    let right =  other.value
    let result = left + right;
    log("Number.add res="+ result + " left="+ left + " right="+ right)
    return result
    // return makeReflexObject(machine, RNumber, [result as unknown as ReflexObject]);
  }
))
numberMethods.set("eq", new WrappedFunction("Number.eq",
  (machine: Machine, other: ReflexNumber) => {
    let left =  (machine.boundSelf! as ReflexNumber).value 
    let right =  other.value
    let result = left === right;
    log("Number.eq res="+ result + " left="+ left + " right="+ right)
    return result
    // return makeReflexObject(machine, RNumber, [result as unknown as ReflexObject]);
  }
))

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
            return !!isInstance
        }
    ))

let metaclassMethods = Metaclass.get("instance_methods")
metaclassMethods.set("new", new WrappedFunction(
  `Meta(Class).new`,
  (_machine: Machine, name: string, customSuper?: ReflexClass) =>
    ReflexClass.make(
      name || 'Anonymous',
      customSuper || ReflexObject.klass
    )
))

let classMethods = Class.get("instance_methods")
classMethods.set("new", new WrappedFunction(
  `Class.new`,
  (machine: Machine, ...args: ReflexObject[]) => makeReflexObject(machine, machine.boundSelf! as ReflexClass, args))
)
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
classMethods.set("isAncestorOf", new WrappedFunction(
  `Class.isAncestorOf`,
  (machine: Machine, other: ReflexClass) => !!other.ancestors.find(o => o === machine.boundSelf!)
));

let Main = ReflexClass.make("Main")
const constructMain = (machine: Machine) =>
  makeReflexObject(machine, Main, [])

export const bootLocals = {
  Object: RObject,
  Class,
  Function: RFunction,
  Main, 
  Nihil,
  Metaclass,
}

export default constructMain;