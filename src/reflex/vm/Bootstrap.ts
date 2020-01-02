import ReflexClass from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";


const classClass = ReflexClass.klass;
classClass.set("class", classClass);

const metaclassClass = ReflexClass.makeClass("Metaclass", ReflexObject.klass, false)
metaclassClass.set("super", classClass);
metaclassClass.set("meta", metaclassClass);
export const classMetaclass = ReflexClass.makeClass("Meta(Class)", metaclassClass, false);

const objectClass = ReflexClass.makeClass("Object", ReflexObject.klass, false);
objectClass.set("super", objectClass);
classClass.set("super", objectClass);
classClass.set("meta", classMetaclass);

const objectMetaclass = ReflexClass.makeClass("Meta(Object)", classMetaclass, false);
objectMetaclass.set("super", metaclassClass);
classMetaclass.set("super", metaclassClass);
classClass.set("meta", classMetaclass);
objectClass.set("meta", objectMetaclass);
ReflexObject.klass = objectClass;
objectClass.wireClassMethods();
classClass.wireClassMethods()
metaclassClass.wireClassMethods();

const functionClass = ReflexClass.makeClass("Function");
ReflexFunction.klass = functionClass;

const nihilClass = ReflexClass.makeClass("Nihil");
ReflexNihil.klass = nihilClass;

let mainClass = ReflexClass.makeClass("Main")
mainClass.get("instance_methods").set("defineMethod", mainClass.eigenclass.get("instance_methods").get("defineMethod"))
let main = new ReflexObject()
main.set('class', mainClass)

export const bootLocals = {
  Object: objectClass,
  Class: classClass,
  Function: functionClass,
  Main: mainClass, 
  Nihil: nihilClass,
}

export default main;