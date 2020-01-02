import ReflexClass from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";


const classClass = ReflexClass.klass;
classClass.set("class", classClass);

const metaclassClass = ReflexClass.makeClass("Metaclass", ReflexObject.klass, false)
metaclassClass.set("super", classClass);
export const classMetaclass = ReflexClass.makeClass("Meta(Class)", metaclassClass, false);

// kind of a hyperclass!
export const metaMetaclass = ReflexClass.makeClass("Meta(Meta)", ReflexObject.klass, false) // shared metaclass of all meta-metaclasses
metaMetaclass.set("super", metaclassClass);
metaMetaclass.set("meta", metaclassClass);


// const basicObject = ReflexClass.makeClass("BasicObject", Reflex)

const objectClass = ReflexClass.makeClass("Object", ReflexObject.klass, false);
objectClass.set("super", objectClass);
classClass.set("super", objectClass);
classClass.set("meta", classMetaclass);

const objectMetaclass = ReflexClass.makeClass("Meta(Object)", classMetaclass, false);
objectMetaclass.set("super", objectMetaclass);
// objectMetaclass.set("meta", objectMetaclass);
classMetaclass.set("super", metaclassClass);
classClass.set("meta", classMetaclass);
objectClass.set("meta", objectMetaclass);
ReflexObject.klass = objectClass;
objectClass.wireClassMethods();
classClass.wireClassMethods()
metaMetaclass.wireClassMethods();

const functionClass = ReflexClass.makeClass("Function");
ReflexFunction.klass = functionClass;

const nihilClass = ReflexClass.makeClass("Nihil");
ReflexNihil.klass = nihilClass;

let mainClass = ReflexClass.makeClass("Main")
mainClass.get("instance_methods").set("defineMethod", mainClass.eigenclass.get("instance_methods").get("defineMethod"))
// mainClass.set('class', classClass)
// mainClass.set('super', objectClass)
let main = new ReflexObject()
main.set('class', mainClass)

// let mainMeta = main

export const bootLocals = {
  Object: objectClass,
  Class: classClass,
  Function: functionClass,
  Main: mainClass, 
  Nihil: nihilClass,
}

// meta wiring

export default main;