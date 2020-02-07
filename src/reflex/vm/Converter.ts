import util from 'util'
import { log, debug } from './util/log';
import ReflexObject from './types/ReflexObject';
import { getLocal } from './instruction/getLocal';
import { ReflexNumber } from './types/ReflexNumber';
import { Indeterminate } from './Bootstrap';
import { Controller } from './Controller';
import ReflexClass from './types/ReflexClass';
import { ReflexString } from './types/ReflexString';
import { ReflexArray } from './types/ReflexArray';
import { ReflexSymbol } from './types/ReflexSymbol';
export class Converter {
    constructor(private ctrl: Controller) { }
    static simpleMappings: { [key: string]: any } = {
        Truth: true,
        Falsity: false,
        Nihil: null,
        Indeterminate: NaN,
        PositiveApeiron: Infinity,
        NegativeApeiron: -Infinity,
    }
    static castReflexToJavascript(object: ReflexObject, depth: number = 0): any {
        if (depth > 8) { console.log("warning, truncating reflex obj: " + object); return null; }
        if (Object.keys(Converter.simpleMappings).includes(object.className)) {
            return Converter.simpleMappings[object.className];
        } 
        else if (object instanceof ReflexNumber) { return object.value; }
        else if (object instanceof ReflexString) { return object.value; }
        else if (object instanceof ReflexSymbol) { return object.value; }
        else if (object instanceof ReflexArray) {
            return object.items.map(it => Converter.castReflexToJavascript(it, depth+1));
        } else {
            return object;
        }
        // return object;
    }
    public castJavascriptToReflex(object: any): ReflexObject {
        if (object instanceof ReflexObject) {
            // log("")
            return object;
        }
        // debug("---> Cast JS to reflex: " + object, this.ctrl.frames)
        if (Array.isArray(object)) {
            let arr: ReflexObject[] = object as unknown as ReflexObject[];
            return (this.ctrl.makeObject(
                getLocal("Array", this.ctrl.frames) as ReflexClass,
                // arr
                arr.map(e=>e instanceof ReflexObject ? e : this.castJavascriptToReflex(e))
            ));
        }
        else if (typeof object === "string") {
            // this.ctrl.makeObject(RString.klass)
            return (this.ctrl.makeObject(getLocal("String", this.ctrl.frames) as ReflexClass, [object as unknown as ReflexObject]));
        }
        else if (typeof object === "number") {
            if (isNaN(object)) {
                // log("WOULD CAST NaN to..." + Indeterminate);
                return (this.ctrl.makeObject(Indeterminate.klass, []));
            }
            if (object === Infinity) {
                return (getLocal("Infinity", this.ctrl.frames));
            }
            else if (object === -Infinity) {
                return (getLocal("NegativeInfinity", this.ctrl.frames));
            }
            else {
                if (Number.isInteger(object)) {
                    return (this.ctrl.makeObject(getLocal("Integer", this.ctrl.frames) as ReflexClass, [object as unknown as ReflexObject]));
                } else {
                    return (this.ctrl.makeObject(getLocal("Float", this.ctrl.frames) as ReflexClass, [object as unknown as ReflexObject]));
                }
            }
        }
        else if (object === true || object === false) {
            let varName = object ? 'true' : 'false';
            return (getLocal(varName, this.ctrl.frames));
        }
        else if (object === null) {
            return (getLocal('nil', this.ctrl.frames));
        }
        else {
            throw new Error("won't return uncast JS object: " + util.inspect(object));
        }
    }
}
