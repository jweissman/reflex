import chalk from 'chalk';
import ReflexObject from "./types/ReflexObject"
import Tree from "../lang/ast/Tree"
export type Op
  = 'push'
  | 'pop'
  // | 'load'
  // | 'store'
  | 'label' 
  // | 'jump'
  | 'call'
  | 'ret'
  | 'halt'
  | 'send'
  | 'send_eq'
  | 'invoke'
  | 'compile' 
  // | 'mark'
  // | 'sweep'
export class Stone { constructor(public name: string) {}}
export type Value = null | string | number | ReflexObject | Tree | Stone
export const prettyValue = (v: Value) => {
  if (v === null) { return ''; }
  else if (typeof v === 'string') { return v; }
  else if (typeof v === 'number') { return String(v); }
  else if (v instanceof ReflexObject) { return v.inspect(); }
  else if (v instanceof Tree) { return v.inspect(); }
  else {
    throw new Error("Called pretty value on unknown: " + v)
    // return v.toString();
  }
}
export type Instruction = [ Op, Value ]
export const prettyInstruct = (inst: Instruction) => {
  let [op, value] = inst
  return [chalk.green(op), chalk.cyan(prettyValue(value))].join(' ')
}
export type Code = Instruction[]
export const prettyCode = (code: Code) => {
  return "\n\n" + code.map(prettyInstruct).join("\n") + chalk.white("\n---\n")
}