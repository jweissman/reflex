import ReflexClass from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction, WrappedFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";
import Machine from "./Machine";
import { log } from "./util/log";

const Class = ReflexClass.klass;
Class.set("class", Class);
const Metaclass = ReflexClass.makeClass("Metaclass", ReflexObject.klass, false)
Metaclass.set("super", Class);
export const ClassMeta = ReflexClass.makeClass("Meta(Class)", Metaclass, false);
// ClassMeta.
const RObject = ReflexClass.makeClass("Object")
RObject.set("super", RObject);
RObject.get("instance_methods").set("eq", new WrappedFunction(
 `Object.eq`,
 (machine: Machine, other: ReflexObject) => {
   log("OBJECT EQ -- " + other.inspect() + " == " + machine.boundSelf!.inspect() + "?");
  //  return other.isEqual(machine.boundSelf!);
   return machine.boundSelf!.isEqual(other);
 }
));

Class.set("super", RObject);
Class.set("meta", ClassMeta);

const ObjectMeta = ReflexClass.makeClass("Meta(Object)", ClassMeta, false);

ClassMeta.set("pre", Class);
ObjectMeta.set("pre", RObject);
Class.set("meta", ClassMeta);
RObject.set("meta", ObjectMeta);
ReflexObject.klass = RObject;

RObject.wireClassMethods();
Class.wireClassMethods()

const RFunction = ReflexClass.makeClass("Function");
ReflexFunction.klass = RFunction;

const Nihil = ReflexClass.makeClass("Nihil");
ReflexNihil.klass = Nihil;

let Main = ReflexClass.makeClass("Main")
Main.get("instance_methods").set("defineMethod", Main.eigenclass.get("instance_methods").get("defineMethod"))
const constructMain = (machine: Machine) =>  ReflexClass.makeInstance(machine, Main, [])

export const bootLocals = {
  Object: RObject,
  Class,
  Function: RFunction,
  Main, 
  Nihil,
  Metaclass,
}

export default constructMain;