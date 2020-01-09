import ReflexClass from "./types/ReflexClass";
import ReflexObject from "./types/ReflexObject";
export class Boots {
  classClass!: ReflexClass;
  metaclass!: ReflexClass;
  object!: ReflexClass;
  classMeta!: ReflexClass;
  objectMeta!: ReflexClass;
  lace() {
    this.classClass = this.assembleClass();
    this.metaclass = this.assembleMetaclassClass();
    this.metaclass.set("pre", this.classClass);
    this.classClass.set("meta", this.metaclass);
    this.object = this.assembleObject();
    this.classClass.set("super", this.object);
    this.objectMeta = ReflexClass.make("Meta(Object)", this.metaclass);
    this.objectMeta.set("pre", this.object);
    this.object.set("meta", this.objectMeta);
  }
  private assembleClass() {
    let classClass = ReflexClass.klass;
    classClass.set("class", classClass);
    return classClass;
  }
  private assembleMetaclassClass() {
    let classMetaclass = ReflexClass.make("Metaclass", ReflexObject.klass);
    classMetaclass.set("super", this.classClass);
    return classMetaclass;
  }
  private assembleObject() {
    const rObject = ReflexClass.make("Object");
    rObject.set("super", rObject);
    return rObject;
  }
}
