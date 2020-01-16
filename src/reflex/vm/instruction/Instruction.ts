import chalk from 'chalk';
import ReflexObject from "../types/ReflexObject"
import Tree from "../../lang/ast/Tree"
import { Value } from './Value';
import { log } from '../util/log';
export type Op
  = 'push'
  | 'pop'
  | 'local_var_get'
  | 'local_var_set'
  | 'local_var_or_eq'
  | 'bare' // handle bareword ...
  // | 'barecall'
  // | 'barecall_block'
  | 'label' 
  | 'jump' // unconditional
  | 'jump_if' // ie jump to label if top is truthy
  | 'call' // call second with top
  | 'ret'
  | 'halt'
  | 'send' // send message to self
  | 'send_eq'
  | 'send_or_eq'
  | 'invoke' // call top
  | 'invoke_block'
  | 'dispatch' // send message to top and call
  | 'compile' 
  | 'mark'
  | 'sweep'
export const prettyValue = (v: Value) => {
  if (v === null) { return ''; }
  else if (typeof v === 'string') { return v; }
  else if (typeof v === 'number') { return String(v); }
  else if (v instanceof ReflexObject) { return v.inspect(); }
  else if (v instanceof Tree) { return v.inspect(); }
  else {
    // return 'undefined!!'
    throw new Error("Called pretty value on unknown: " + v)
    // return v.toString();
  }
}
export type Instruction = [ Op, Value ]
export const prettyInstruct = (inst: Instruction) => {
  let [op, value] = inst
  if (op === 'label') {
    return chalk.white(prettyValue(value)) + ":"
  } else {
    return [chalk.green(op), chalk.cyan(prettyValue(value))].join(' ')
  }
}
export type Code = Instruction[]
export const prettyCode = (code: Code) => {
  return "\n\n" + code.map((line,i) => `${i}. ${prettyInstruct(line)}`).join("\n") + chalk.white("\n---\n")
}
export const labelStep = (code: Code, label: string) => code.find(([op, val]) => op === 'label' && val === label)
export const indexForLabel = (code: Code, label: string) => {
    let step = labelStep(code, label) 
    if (step) {
        let lineNumber = code.indexOf(step)
        log("FOUND " + label + " AT " + lineNumber)
        return lineNumber
    } else {
        throw new Error("no such label found: " + label)
    }
}

export const nextOperativeCommand = (code: Code) => code.find(([op]) => op !== 'label')