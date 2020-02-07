import ReflexObject from "../types/ReflexObject";
import Tree from "../../lang/ast/Tree";
import { Stone } from './Stone';

export class Reference { constructor(public name: string, public item: Value) {} }
export class Destructure { constructor(public name: string) {} }
type List = Value[]
export type Value = null | string | number | ReflexObject | Tree | Stone | Reference | Destructure | List;
