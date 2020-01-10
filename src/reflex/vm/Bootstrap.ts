import ReflexClass from "./types/ReflexClass";
import { defineClassMethod } from "./types/defineClassMethod";
import { defineInstanceMethod } from "./types/defineInstanceMethod";
import { makeReflexObject } from "./types/makeReflexObject";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction, WrappedFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";
import Machine from "./Machine";
import { log } from "./util/log";
import { ReflexNumber, IndeterminateForm, NegativeInfinity, PositiveInfinity } from "./types/ReflexNumber";
import { Boots } from "./Boots";

let boots: Boots = new Boots();
boots.lace();

const Class = boots.classClass;
const Metaclass = boots.metaclass;
const RObject = boots.object;
ReflexObject.klass = RObject;

const RFunction = ReflexClass.make("Function");
ReflexFunction.klass = RFunction;

export const Nihil = ReflexClass.make("Nihil");
ReflexNihil.klass = Nihil;

export const RNumber = ReflexClass.make("Number");
ReflexNumber.klass = RNumber;

export const Indeterminate = ReflexClass.make("Indeterminate", RNumber);
IndeterminateForm.klass = Indeterminate;
export const PositiveApeiron = ReflexClass.make("PositiveApeiron", RNumber);
PositiveInfinity.klass = PositiveApeiron;
export const NegativeApeiron = ReflexClass.make("NegativeApeiron", RNumber);
NegativeInfinity.klass = NegativeApeiron;

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
  `Metaclass.new`,
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

let Kernel = ReflexClass.make("Kernel")
Kernel.eigenclass.get("instance_methods").set("import", new WrappedFunction(
  `Kernel.import`,
  (machine: Machine, filename: string) => machine.import(filename))
)

let arithmetic = {
  eq: (left: number, right: number) => left === right,
  add: (left: number, right: number) => {
    let result = left + right
    // console.log("ADD " + left + " " + right + " YIELDING " + result)
    return result
  },
  sub: (left: number, right: number) => left - right,
  mult: (left: number, right: number) => left * right,
  div: (left: number, right: number) => {
    // log("DIVIDE " + left + " by " + right)
    return left / right
  },
  mod: (left: number, right: number) => left % right,
  neg: (val: number) => -val,
}

let numberMethods = RNumber.get("instance_methods");
numberMethods.set("add", new WrappedFunction("Number.add", (machine: Machine, other: number) => 
    arithmetic.add((machine.boundSelf! as ReflexNumber).value, other)
))
numberMethods.set("subtract", new WrappedFunction("Number.subtract", (machine: Machine, other: number) => 
    arithmetic.sub((machine.boundSelf! as ReflexNumber).value, other)
))
numberMethods.set("multiply", new WrappedFunction("Number.multiply", (machine: Machine, other: number) => 
    arithmetic.mult((machine.boundSelf! as ReflexNumber).value, other)
))
numberMethods.set("rawDiv", new WrappedFunction("Number.rawDiv", (machine: Machine, other: number) => 
    arithmetic.div((machine.boundSelf! as ReflexNumber).value, other)
))
numberMethods.set("modulo", new WrappedFunction("Number.rawDiv", (machine: Machine, other: number) => 
    arithmetic.mod((machine.boundSelf! as ReflexNumber).value, other)
))
numberMethods.set("eq", new WrappedFunction("Number.eq", (machine: Machine, other: number) => 
    arithmetic.eq((machine.boundSelf! as ReflexNumber).value, other)
))
numberMethods.set("negate", new WrappedFunction("Number.negate", (machine: Machine) => 
    arithmetic.neg((machine.boundSelf! as ReflexNumber).value)
))

// PositiveApeiron.get("instance_methods").set("value", Infinity)
// NegativeInfinity.set("value", -Infinity)

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
  Kernel,
  Number: RNumber,
  Indeterminate,
  PositiveApeiron,
  NegativeApeiron,
}

export default constructMain;