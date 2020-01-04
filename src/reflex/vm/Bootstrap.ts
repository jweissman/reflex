import ReflexClass from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";

class BasicObject {
  klass: ReflexClass = ReflexClass.makeClass("BasicObject")
}


// Class: the class of classes
const Class = ReflexClass.klass;
Class.set("class", Class);

// Metaclass: the class of eigenclasses
const Metaclass = ReflexClass.makeClass("Metaclass", ReflexObject.klass, false)
Metaclass.set("super", Class);
// Metaclass.set("meta", Metaclass);
// Metaclass.set("pre", Metaclass);
// Metaclass.wireClassMethods();

export const ClassMeta = ReflexClass.makeClass("Meta(Class)", Metaclass, false);

// const BasicObject = BasicObject.klass;
const RObject = ReflexClass.makeClass("Object") //, BasicObject.klass, false);
RObject.set("super", RObject);

Class.set("super", RObject);
Class.set("meta", ClassMeta);

const ObjectMeta = ReflexClass.makeClass("Meta(Object)", Metaclass, false);
ObjectMeta.set("super", Metaclass);
// ObjectMeta.set("meta", Metaclass);
ObjectMeta.set("pre", RObject);
ClassMeta.set("super", Metaclass);
ClassMeta.set("pre", Class);
Class.set("meta", ClassMeta);
RObject.set("meta", ObjectMeta);
ReflexObject.klass = RObject;
RObject.wireClassMethods();
Class.wireClassMethods()
// ObjectMeta.wireClassMethods();
// ClassMeta.wireClassMethods();

const RFunction = ReflexClass.makeClass("Function");
ReflexFunction.klass = RFunction;

const Nihil = ReflexClass.makeClass("Nihil");
ReflexNihil.klass = Nihil;
// Nihil.wireClassMethods()

let Main = ReflexClass.makeClass("Main")
Main.get("instance_methods").set("defineMethod", Main.eigenclass.get("instance_methods").get("defineMethod"))
let main = new ReflexObject()
main.set('class', Main)

export const bootLocals = {
  Object: RObject,
  Class,
  Function: RFunction,
  Main, 
  Nihil,
  Metaclass,
}

export default main;