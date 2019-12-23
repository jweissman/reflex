import ReflexClass from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";

const classClass = ReflexClass.klass;
classClass.set("class", classClass);
const objectClass = ReflexClass.assemble("Object");
objectClass.set("super", objectClass);
classClass.set("super", objectClass);
ReflexObject.klass = objectClass;

const functionClass = ReflexClass.assemble("Function");

// objectClass.set("class", classClass);
// objectClass.set("super", objectClass);
// functionClass.set("class", classClass)
// functionClass.set("super", objectClass);

let mainClass = ReflexClass.assemble("Main")
mainClass.set('class', classClass)
mainClass.set('super', objectClass)

let main = new ReflexObject()
main.set('class', mainClass)

main.set('Object', objectClass)
main.set('Class', classClass)
main.set('Function', functionClass)
main.set('Main', mainClass)

export default main;