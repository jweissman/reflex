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
import { ReflexString } from "./types/ReflexString";
import { log } from "./util/log";
import { prettyObject } from "../prettyObject";

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

export const RString = ReflexClass.make("String")
ReflexString.klass = RString;

let objectMethods = RObject.get("instance_methods")
objectMethods.set("inspect", new WrappedFunction(`Object.inspect`,
 (machine: Machine) => machine.boundSelf!.inspect()
));
objectMethods.set("eq", new WrappedFunction(`Object.eq`,
 (machine: Machine, other: ReflexObject) => machine.boundSelf!.isEqual(other)
));
objectMethods.set("send", new WrappedFunction(`Object.send`,
 (machine: Machine, message: string, ...args: ReflexObject[]) => {
  //  log("MANUAL OBJECT SEND: " + message + " TO " + machine.boundSelf!.inspect()) //, machine.activeFrames)
   let fn = (machine.boundSelf!.send(message));
  //  log("MANUAL OBJECT SEND: " + message + " -> sent: " + fn) //, machine.activeFrames)
    if (fn instanceof ReflexFunction) { //} || fn instanceof WrappedFunction) {
      return machine.doInvoke(
        undefined,
        fn,
        ...args
      );
    } else if (fn instanceof WrappedFunction) { //} || fn instanceof WrappedFunction) {
      // throw new Error("send wrapped fn not impl -- " + message)
      args.forEach(arg => machine.stack.push(arg))
      machine.stack.push(fn)
      machine.controller.invoke(args.length, false);

    } else {
      throw new Error("Not a function -- " + message)
    }
  }
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
  (machine: Machine, name: string, fn: ReflexFunction) => 
    defineInstanceMethod(machine.boundSelf! as ReflexClass, fn, name)
  
));
classMethods.set("defineClassMethod", new WrappedFunction(`Class.defineClassMethod`,
  (machine: Machine, name: string, fn: ReflexFunction) => defineClassMethod(machine.boundSelf! as ReflexClass, fn, name)
))
classMethods.set("isAncestorOf", new WrappedFunction(
  `Class.isAncestorOf`,
  (machine: Machine, other: ReflexClass) => !!other.ancestors.find(o => o === machine.boundSelf!)
));

let Kernel = ReflexClass.make("Kernel")
let kernelMethods = Kernel.eigenclass.get("instance_methods");
kernelMethods.set("import", new WrappedFunction(
  `Kernel.import`,
  (machine: Machine, filename: string) => machine.import(filename))
)
kernelMethods.set("include", new WrappedFunction(
  `Kernel.include`,
  (_machine: Machine, theModule: ReflexObject, theSelf: ReflexObject) => {
    if (theModule instanceof ReflexClass) {
      let self = theSelf as ReflexClass;
      let selfMethods = self.get("instance_methods")
      let moduleMethods = theModule.get("instance_methods")
      Object.keys(moduleMethods.members).forEach(memberKey => {
        selfMethods.set(memberKey, moduleMethods.get(memberKey))
      })
    }
    return theModule;
  }
));
kernelMethods.set("throw", new WrappedFunction(
  `Kernel.throw`,
  (machine: Machine, err: string) => machine.throw(err))
)
kernelMethods.set("println", new WrappedFunction(`Kernel.println`, (machine: Machine, ...args: any[]) => {
  machine.tracedOutput.push(args.join(""))
  args.forEach(arg => {
    process.stdout.write(arg)
  })
  process.stdout.write("\n")
  // console.log(...args)
  return null
}))

type ArithOp = 'add' | 'subtract' | 'multiply' | 'divide' | 'mod' | 'neg' | 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'to_s' | 'to_i'
let arithmetic: { [key in ArithOp]: Function} = {
  add: (left: number, right: number) => {
    // console.log("Arithmetic ADD -- " + left + " + " + right)
    return left + right
  },
  subtract: (left: number, right: number) => left - right,
  multiply: (left: number, right: number) => left * right,
  divide: (left: number, right: number) => left / right,
  mod: (left: number, right: number) => left % right,
  neg: (val: number) => -val,
  eq: (left: number, right: number) => {
    let equal = left === right
    // log("EQ? " + left + " / " + right + " => " + equal)
    return equal
  },
  gt: (left: number, right: number) => left > right,
  gte: (left: number, right: number) => left >= right,
  lt: (left: number, right: number) => left < right,
  lte: (left: number, right: number) => left <= right,
  to_s: (num: number) => num.toString(),
  to_i: (num: number) => Math.round(num),
}
let numberMethods = RNumber.get("instance_methods");

const defineArithmetic = (methodName: ArithOp, customName?: string) => {
  let name = customName || methodName
  numberMethods.set(name, new WrappedFunction("Number#" + name, (machine: Machine, other: number) =>
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
defineArithmetic('to_s', 'toString'); //, 'toString');
defineArithmetic('to_i', 'toInteger'); //, 'toString');

let arrayMethods = RArray.get("instance_methods");
arrayMethods.set("get", new WrappedFunction("Array#get", (machine: Machine, index: number) =>
  (machine.boundSelf! as ReflexArray).at(index)
))
arrayMethods.set("set", new WrappedFunction("Array#set", (machine: Machine, index: ReflexNumber, value: ReflexObject) =>
  (machine.boundSelf! as ReflexArray).put(index, value),
  false
))
arrayMethods.set("length", new WrappedFunction("Array#length", (machine: Machine) =>
  (machine.boundSelf! as ReflexArray).items.length
))
arrayMethods.set("concat", new WrappedFunction("Array#concat", (machine: Machine, other: ReflexObject[]) =>
  [...(machine.boundSelf! as ReflexArray).items, ...other],
  // false
))

let stringMethods = RString.get("instance_methods");
stringMethods.set("concat", new WrappedFunction("String.concat", (machine: Machine, other: string) => {
  let self = (machine.boundSelf! as ReflexString).value;
  let concatenated = `${self}${(other)}`
  // console.log("STRING CONCAT: '" + self + "'(self) + '" + other + "'(other) => '" + concatenated +"'")
  return concatenated
}))
stringMethods.set("length", new WrappedFunction("String.length", (machine: Machine) =>
  (machine.boundSelf! as ReflexString).value.length
))
stringMethods.set("toArray", new WrappedFunction("String.toArray", (machine: Machine) =>
  (machine.boundSelf! as ReflexString).value.split('')
))
stringMethods.set("eq", new WrappedFunction("String.eq", (machine: Machine, other: string) =>
  (machine.boundSelf! as ReflexString).value === other
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
  Array: RArray,
  String: RString,
  Number: RNumber,
  // Float: RFloat,
  // Integer: RInt,
  Indeterminate,
  PositiveApeiron,
  NegativeApeiron,
}

export default constructMain;