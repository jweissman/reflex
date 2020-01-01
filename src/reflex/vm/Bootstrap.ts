import ReflexClass from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";


const classClass = ReflexClass.klass;
classClass.set("class", classClass);

const metaclassClass = ReflexClass.makeClass("Metaclass", ReflexObject.klass, false)
const classMetaclass = ReflexClass.makeClass("Meta(Class)", metaclassClass, false);


// const basicObject = ReflexClass.makeClass("BasicObject", Reflex)

const objectClass = ReflexClass.makeClass("Object", ReflexObject.klass, false);
objectClass.set("super", objectClass);
classClass.set("super", objectClass);
classClass.set("meta", classMetaclass);

const objectMetaclass = ReflexClass.makeClass("Meta(Object)", classMetaclass, false);
objectMetaclass.set("super", objectMetaclass);
objectMetaclass.set("meta", objectMetaclass);
classMetaclass.set("super", objectMetaclass);
classClass.set("meta", classMetaclass);
objectClass.set("meta", objectMetaclass);
ReflexObject.klass = objectClass;
objectClass.wireInstanceMethods();
classClass.wireInstanceMethods()

const functionClass = ReflexClass.makeClass("Function");
ReflexFunction.klass = functionClass;

const nihilClass = ReflexClass.makeClass("Nihil");
ReflexNihil.klass = nihilClass;

let mainClass = ReflexClass.makeClass("Main")
// mainClass.set('class', classClass)
// mainClass.set('super', objectClass)
let main = new ReflexObject()
main.set('class', mainClass)

export const bootLocals = {
  Object: objectClass,
  Class: classClass,
  Function: functionClass,
  Main: mainClass, 
  Nihil: nihilClass,
}

// meta wiring

export default main;