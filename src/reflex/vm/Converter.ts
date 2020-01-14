import util from 'util'
import { log } from './util/log';
import ReflexObject from './types/ReflexObject';
import { getLocal } from './instruction/getLocal';
import { ReflexNumber } from './types/ReflexNumber';
import { Indeterminate, RNumber } from './Bootstrap';
import { Controller } from './Controller';
import ReflexClass from './types/ReflexClass';
// do conversions/casting?
export class Converter {
    constructor(private ctrl: Controller) { }
    static castReflexToJavascript(object: ReflexObject): any {
        if (object.className === 'Truth') {
            return true;
        }
        else if (object.className === 'Nihil') {
            return null;
        }
        else if (object.className === 'Falsity') {
            return false;
        }
        else if (object.className === 'Indeterminate') {
            return NaN;
        }
        else if (object.className === 'PositiveApeiron') {
            return Infinity;
        }
        else if (object.className === 'NegativeApeiron') {
            return -Infinity;
        }
        else if (object instanceof ReflexNumber) {
            return object.value;
        }
        return object;
    }
    public castJavascriptToReflex(object: any): ReflexObject {
        if (object instanceof ReflexObject) {
            return object;
        }
        else if (typeof object === "number") {
            if (isNaN(object)) {
                log("WOULD CAST NaN to..." + Indeterminate);
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
