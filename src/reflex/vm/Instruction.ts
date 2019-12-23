import ReflexObject from "./types/ReflexObject"
import Tree from "../lang/ast/Tree"
export type Op
  = 'push'
  | 'pop'
  | 'load'
  | 'store'
  | 'label' 
  | 'jump'
  | 'call'
  | 'ret'
  | 'halt'
  | 'send'
  | 'send_eq'
  | 'invoke'
  | 'compile' 
export type Value = null | string | number | ReflexObject | Tree
export type Instruction = [ Op, Value ]
export type Code = Instruction[]