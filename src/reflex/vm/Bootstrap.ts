import ReflexClass from "./types/ReflexClass";
import { defineClassMethod } from "./types/defineClassMethod";
import { defineInstanceMethod } from "./types/defineInstanceMethod";
import { makeReflexObject } from "./types/makeReflexObject";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction, WrappedFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";
import Machine from "./Machine";
import { ReflexNumber, IndeterminateForm, NegativeInfinity, PositiveInfinity } from "./types/ReflexNumber";
import { Boots } from "./Boots";
import { ReflexArray } from "./types/ReflexArray";

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

export const RArray = ReflexClass.make("Array")
ReflexArray.klass = RArray;

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
let newObjectFunction = new WrappedFunction(
  `Class.new`,
  (machine: Machine, ...args: ReflexObject[]) => makeReflexObject(machine, machine.boundSelf! as ReflexClass, args),
  false
)
// console.log("NEW OBJ FN", newObjectFunction.inspect())
classMethods.set("new", newObjectFunction)
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

type ArithOp = 'add' | 'subtract' | 'multiply' | 'divide' | 'mod' | 'neg' | 'eq' | 'gt' | 'gte' | 'lt' | 'lte'
let arithmetic: { [key in ArithOp]: Function} = {
  add: (left: number, right: number) => left + right,
  subtract: (left: number, right: number) => left - right,
  multiply: (left: number, right: number) => left * right,
  divide: (left: number, right: number) => left / right,
  mod: (left: number, right: number) => left % right,
  neg: (val: number) => -val,
  eq: (left: number, right: number) => left === right,
  gt: (left: number, right: number) => left > right,
  gte: (left: number, right: number) => left >= right,
  lt: (left: number, right: number) => left < right,
  lte: (left: number, right: number) => left <= right,
}
let numberMethods = RNumber.get("instance_methods");
const defineArithmetic = (methodName: ArithOp, customName?: string) => {
  let name = customName || methodName
  numberMethods.set(name, new WrappedFunction("Number." + name, (machine: Machine, other: number) =>
    (arithmetic[methodName] as Function)((machine.boundSelf! as ReflexNumber).value, other)
  ))
}
defineArithmetic('add');
defineArithmetic('subtract');
defineArithmetic('multiply');
defineArithmetic('divide', 'rawDiv');
defineArithmetic('mod', 'modulo');
defineArithmetic('eq');
defineArithmetic('neg', 'negate');
defineArithmetic('gt');
defineArithmetic('gte');
defineArithmetic('lt');
defineArithmetic('lte');

let arrayMethods = RArray.get("instance_methods");
arrayMethods.set("get", new WrappedFunction("Array.get", (machine: Machine, index: number) =>
  (machine.boundSelf! as ReflexArray).at(index)
))
arrayMethods.set("set", new WrappedFunction("Array.set", (machine: Machine, index: ReflexNumber, value: ReflexObject) =>
  (machine.boundSelf! as ReflexArray).put(index, value),
  false
))

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
  // Float: RFloat,
  // Integer: RInt,
  Indeterminate,
  PositiveApeiron,
  NegativeApeiron,
}

export default constructMain;