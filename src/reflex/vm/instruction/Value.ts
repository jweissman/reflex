import ReflexObject from "../types/ReflexObject";
import Tree from "../../lang/ast/Tree";
import { Stone } from './Stone';
export type Value = null | string | number | ReflexObject | Tree | Stone;
