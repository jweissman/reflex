import chalk from 'chalk';
import ReflexObject from "./types/ReflexObject"
import Tree from "../lang/ast/Tree"
export type Op
  = 'push'
  | 'pop'
  // | 'load'
  
  // | 'store'
  | 'local_var_set'

  | 'label' 
  // | 'jump'
  | 'call'
  | 'ret'
  | 'halt'
  | 'send'
  | 'send_eq'
  | 'send_or_eq'
  | 'invoke'
  | 'compile' 
  | 'mark'
  | 'sweep'
export class Stone {
  constructor(public name: string) {}
  toString() { return `__${this.name}__`; }
}
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
  return "\n\n" + code.map((line,i) => `${i}. ${prettyInstruct(line)}`).join("\n") + chalk.white("\n---\n")
}
export const labelStep = (code: Code, label: string) => code.find(([op, val]) => op === 'label' && val === label)
export const indexForLabel = (code: Code, label: string) => {
    let step = labelStep(code, label) 
    if (step) {
        return code.indexOf(step)
    } else {
        throw new Error("no such label found: " + label)
    }
}