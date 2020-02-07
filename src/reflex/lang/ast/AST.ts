import Tree from "./Tree";
import { Program } from "./Program";
import { Bareword } from "./Bareword";
import { Sequence } from "./Sequence";
import { Node } from 'ohm-js';
import { SendMethodCall } from "./SendMethodCall";
import { Message } from "./Message";
import { SendMessage } from "./SendMessage";
import { StringLiteral } from "./StringLit";
import { SymbolLiteral } from "./SymbolLiteral";
import SendMessageEq from "./SendMessageEq";
import { Defun } from "./Defun";
import { FunctionLiteral } from "./FunctionLiteral";
import { Defclass } from "./Defclass";
import LocalVarSet from "./LocalVarSet";
import { Barecall } from "./Barecall";
import { PipedBlock } from "./PipedBlock";
import { Arguments, Argument } from "./Arguments";
import { Parameter, ParameterReference, ParameterDestructuring } from "./Parameter";
import { Compare } from "./Compare";
import { Conditional } from "./Conditional";
import { NumberLiteral } from "./NumberLiteral";
import { Negate } from "./Negate";
import { Binary } from "./Binary";
import { Loop } from "./Loop";
import { LogicalNot } from './LogicalNot';
import { ArrayLiteral } from './ArrayLiteral';
import { RangeLiteral } from './RangeLiteral';
import { ArrayIndex } from './ArrayIndex';
import { ArrayIndexEq } from './ArrayIndexEq';
import { TupleLit } from "./TupleLit";
import { HashLiteral } from "./HashLiteral";

function capitalize(str: string) { return str.charAt(0).toUpperCase() + str.slice(1) }

export const ast: { [key: string]: (...args: any[]) => Tree | string } = {
  Program: (prog: Node) => 
    new Program(prog.tree),
  StmtList: (_pre: Node, list: Node, _post: Node) => list.tree,
  Stmt: (_pre: Node, expr: Node) => expr.tree,
  PlainClass: (_class: Node, name: Node, block: Node) =>
    new Defclass(name.tree, block.tree),
  ClassDefinition_arch: (arch: Node, name: Node, block: Node) =>
    new Defclass(name.tree, block.tree, new Bareword(capitalize(arch.sourceString))),
  SubclassDefinition: (_class: Node, name: Node, superclass: Node, block: Node) =>
    new Defclass(name.tree, block.tree, superclass.tree),
  ClassName: (id: Node) => new Message(id.sourceString),
  ExtendsClass: (_extends: Node, name: Node) => name.tree,
  Defun_formal: (name: Node, params: Node, block: Node) =>
    new Defun(name.tree, params.tree, block.tree),
  Defun_doEnd: (_def: Node, name: Node, params: Node, block: Node) =>
    new Defun(name.tree, params.tree, block.tree),
  FunctionName: (id: Node) => new Message(id.sourceString),
  PipedBlock: (_lb: Node, pipeVars: Node, block: Node, _rb: Node) => {
    let pipe = pipeVars.tree[0] || new Sequence([]);
    return new PipedBlock(pipe, block.tree)
  },
  PipeVars: (_lp: Node, pipeVars: Node, _rp: Node) => pipeVars.tree,
  CasualArguments: (args: Node) => Arguments.from(args.tree),
  CasualArguments_block: (args: Node, block: Node) => Arguments.from(args.tree, block.tree),
  CarefulArguments: (args: Node) => Arguments.from(args.tree),
  CarefulArguments_block: (block: Node) => Arguments.from(new Sequence([]), block.tree),
  CarefulArguments_args_block: (args: Node, block: Node) => Arguments.from(args.tree, block.tree),
  FormalArguments: (_lp: Node, args: Node, _rp: Node) => args.tree,
  Arg_ref: (_amp: Node, expr: Node) => new Argument(expr.tree, true),
  Arg_ellipsis: (_amp: Node, expr: Node) => new Argument(expr.tree, false, true),
  Arg: (expr: Node) => expr.tree instanceof Argument ? expr.tree : new Argument(expr.tree, false),
  Block: (_lb: Node, body: Node, _rb: Node) => body.tree,
  PartBlock: (body: Node, _rb: Node) => body.tree,
  ObjectDot_dot: (receiver: Node, _dot: Node, message: Node, _andDot: Node) => new SendMessage(receiver.tree, message.tree),
  EqExpr_send_eq: (receiver: Node, _dot: Node, message: Node, _eq: Node, expr: Node) => new SendMessageEq(receiver.tree, message.tree, expr.tree),
  EqExpr_arr_set_eq: (arrIndex: Node, _eq: Node, expr: Node) => new ArrayIndexEq(arrIndex.tree, expr.tree),
  CoreExpr_funcall: (fn: Node, args: Node) => new Barecall(new Bareword(fn.tree.key), args.tree),
  FormalParams: (_lp: Node, paramList: Node, _rp: Node) => paramList.tree,
  Param: (parameter: Node) => {
    if (parameter.tree instanceof Bareword) {
      return new Parameter(parameter.tree.word)
    } else if (parameter.tree instanceof Parameter) {
      return parameter.tree;
    } else {
      throw new Error('Invalid parameter type: ' + parameter.tree)
    }
  },
  Param_ref: (_amp: Node, word: Node) => new ParameterReference((word.tree as Bareword).word),
  Param_ellipsis: (_amp: Node, word: Node) => new ParameterDestructuring((word.tree as Bareword).word),
  EqExpr_local_eq: (message: Node, _eq: Node, expr: Node) => new LocalVarSet(message.tree, expr.tree),
  Message: (contents: Node) => new Message(contents.sourceString),
  Name: (contents: Node) => new Message(contents.sourceString),
  Bareword: (word: Node) => new Bareword((word.tree as Message).key),
  CasualCall_obj: (objDot: Node, _dot: Node, msg: Node, args: Node) => new SendMethodCall(objDot.tree, msg.tree, Arguments.from(args.tree)),
  CasualCall_msg: (message: Node, args: Node) => new Barecall(message.tree, args.tree),
  ObjectDot_call: (objDot: Node, _dot: Node, msg: Node, args: Node, _nextDot: Node) => new SendMethodCall(objDot.tree, msg.tree, args.tree),
  ObjectExpr_dot: (objDot: Node, _dot: Node, msg: Node) => new SendMessage(objDot.tree, msg.tree),
  ObjectExpr_call: (objDot: Node, _dot: Node, msg: Node, args: Node) => new SendMethodCall(objDot.tree, msg.tree, args.tree),
  ParenExpr: (_lp: Node, expr: Node, _rp: Node) => expr.tree,
  PriExpr_neg: (_neg: Node, expr: Node) => new Negate(expr.tree),
  CmpExpr_eq: (left: Node, _eq: Node, right: Node) => new Compare('==', left.tree, right.tree),
  CmpExpr_neq: (left: Node, _eq: Node, right: Node) => new Compare('!=', left.tree, right.tree),
  CmpExpr_lt: (left: Node, _eq: Node, right: Node) => new Compare('<', left.tree, right.tree),
  CmpExpr_gt: (left: Node, _eq: Node, right: Node) => new Compare('>', left.tree, right.tree),
  CmpExpr_lte: (left: Node, _eq: Node, right: Node) => new Compare('<=', left.tree, right.tree),
  CmpExpr_gte: (left: Node, _eq: Node, right: Node) => new Compare('>=', left.tree, right.tree),
  CondStmt_ifThenElse: (_if: Node, cond: Node, _then: Node, left: Node, _else: Node, right: Node) =>
    new Conditional('if', cond.tree, left.tree, right.tree),
  BoolExpr_tern: (cond: Node, _q: Node, left: Node, _colon: Node, right: Node) =>
    new Conditional('if', cond.tree, left.tree, right.tree),
  CondTernary: (cond: Node, _q: Node, left: Node, _colon: Node, right: Node) =>
    new Conditional('if', cond.tree, left.tree, right.tree),
  CondStmt_ifThen: (_if: Node, cond: Node, _then: Node, left: Node) =>
    new Conditional('if', cond.tree, left.tree, new Bareword('nil')),
  CondParticle_if: (left: Node, _if: Node, cond: Node) =>
    new Conditional('if', cond.tree, left.tree, new Bareword('nil')),
  CondParticle_unless: (left: Node, _if: Node, cond: Node) =>
    new Conditional('unless', cond.tree, left.tree, new Bareword('nil')),
  CondParticle_ifElse: (left: Node, _if: Node, cond: Node, _else: Node, right: Node) =>
    new Conditional('if', cond.tree, left.tree, right.tree),
  CondParticle_unlessElse: (left: Node, _unless: Node, cond: Node, _else: Node, right: Node) =>
    new Conditional('unless', cond.tree, left.tree, right.tree),
  CondStmt_unlessThenElse: (_if: Node, cond: Node, _then: Node, left: Node, _else: Node, right: Node) =>
    new Conditional('unless', cond.tree, left.tree, right.tree),
  CondStmt_unlessThen: (_unless: Node, cond: Node, _then: Node, left: Node) =>
    new Conditional('unless', cond.tree, left.tree, new Bareword('nil')),
  LoopExpr_until: (_until: Node, test: Node, block: Node) =>
    new Loop('until', test.tree, block.tree),
  LoopExpr_while: (_until: Node, test: Node, block: Node) =>
    new Loop('while', test.tree, block.tree),
  BoolExpr_bool_or: (left: Node, _or: Node, right: Node) =>
    new Conditional('if', left.tree, left.tree, right.tree),
  BoolExpr_bool_and: (left: Node, _or: Node, right: Node) =>
    new Conditional('if', left.tree, right.tree, new Bareword('false')),
  PriExpr_not: (_not: Node, expr: Node) =>
    new LogicalNot(expr.tree),
  AddExpr_sum: (left: Node, _sum: Node, right: Node) =>
    new Binary('+', left.tree, right.tree),
  AddExpr_difference: (left: Node, _sum: Node, right: Node) =>
    new Binary('-', left.tree, right.tree),
  MulExpr_product: (left: Node, _sum: Node, right: Node) =>
    new Binary('*', left.tree, right.tree),
  MulExpr_quotient: (left: Node, _sum: Node, right: Node) =>
    new Binary('/', left.tree, right.tree),
  MulExpr_modulo: (left: Node, _sum: Node, right: Node) =>
    new Binary('%', left.tree, right.tree),
  PowExpr_exponent: (left: Node, _sum: Node, right: Node) =>
    new Binary('^', left.tree, right.tree),
  FormalFunctionLiteral: (params: Node, _arrow: Node, block: Node) => new FunctionLiteral(params.tree, block.tree),
  StabbyFunctionLiteral: (_stab: Node, block: Node) => new FunctionLiteral(new Sequence([]), block.tree),
  StringLit: (_lq: Node, lit: Node, _rq: Node) => new StringLiteral(lit.tree.join("")),
  SymbolLit: (_col: Node, lit: Node) => new SymbolLiteral(lit.tree.join("")),
  doubleStringCharacter_escaped: (_esc: Node, lit: Node) => lit.tree,
  
  unicodeLiteral: (_u: Node, a: Node, b: Node, c: Node, d: Node) => {
   let alpha = parseInt(a.sourceString, 16);
   let beta = parseInt(b.sourceString, 16);
   let gamma = parseInt(c.sourceString, 16);
   let delta = parseInt(d.sourceString, 16);
   return String.fromCharCode(
     alpha * 0x1000 +
     beta * 0x0100 +
     gamma * 0x0010 +
     delta * 0x0001
   );
  },
  
  sourceCharacter: (char: Node) => char.sourceString,
  symbolCharacter: (char: Node) => char.sourceString,
  RangeLit: (start: Node, _dots: Node, stop: Node) => new RangeLiteral(start.tree, stop.tree),
  NumberLit_int: (digits: Node) => new NumberLiteral(Number(digits.sourceString)),
  NumberLit_float: (whole: Node, _dot: Node, fraction: Node) => new NumberLiteral(
    Number(`${whole.sourceString}.${fraction.sourceString}`), true),
  HashLit: (_lb: Node, tupleSeq: Node, _rb: Node) => new HashLiteral(tupleSeq.tree),
  Tuple_kv: (key: Node, colon: Node, value: Node) => new TupleLit(key.sourceString, value.tree),
  ArrayLit: (_lq: Node, seq: Node, _rq: Node) => new ArrayLiteral(seq.tree),
  ArrayIndex: (array: Node, _lb: Node, index: Node, _rb: Node) => new ArrayIndex(array.tree, index.tree),
  NonemptyListOf: (eFirst: Node, _sep: any, eRest: Node) => new Sequence([eFirst.tree, ...eRest.tree]),
  EmptyListOf: () => new Sequence([]),
}