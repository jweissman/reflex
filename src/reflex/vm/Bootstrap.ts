import ReflexClass from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
import { ReflexFunction } from "./types/ReflexFunction";
import { ReflexNihil } from "./types/ReflexNihil";


const classClass = ReflexClass.klass;
classClass.set("class", classClass);

const objectClass = ReflexClass.makeClass("Object");
objectClass.set("super", objectClass);
classClass.set("super", objectClass);
ReflexObject.klass = objectClass;

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

//main.set('Object', objectClass)
//main.set('Class', classClass)
//main.set('Function', functionClass)
//main.set('Main', mainClass)

export default main;