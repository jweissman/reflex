import ReflexObject from "./ReflexObject";
import ReflexClass from "./ReflexClass";
export function makeMetaclass(proto: ReflexObject) {
    let protoclass: ReflexClass = proto.isClass ? proto as ReflexClass : proto.klass;
    let name = proto.isClass
        ? `Meta(${protoclass.name})`
        : `Meta(${protoclass.name} instance)`;
    let supermeta = proto.isClass ? protoclass.superclass.eigenclass : protoclass.eigenclass;
    let meta = ReflexClass.make(name, supermeta);
    meta.set("pre", proto);
    return meta;
}
