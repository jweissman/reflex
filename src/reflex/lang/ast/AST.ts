import Tree from "./Tree";
import { Program } from "./Program";
import { Bareword } from "./Bareword";
import { Sequence } from "./Sequence";
import { Node } from 'ohm-js';
import { SendMethodCall } from "./SendMethodCall";
import { Message } from "./Message";
import { SendMessage } from "./SendMessage";
import { StringLiteral } from "./StringLit";
import SendMessageEq from "./SendMessageEq";
import { Defun } from "./Defun";
import { FunctionLiteral } from "./FunctionLiteral";
import { Defclass } from "./Defclass";
import LocalVarSet from "./LocalVarSet";
import { Barecall } from "./Barecall";
import { PipedBlock } from "./PipedBlock";
import { Arguments, Argument } from "./Arguments";
import { Parameter } from "./Parameter";
import { Compare } from "./Compare";
import { Conditional } from "./Conditional";
import { NumberLiteral } from "./NumberLiteral";
import { Negate } from "./Negate";
import { Binary } from "./Binary";
import { Code } from "../../vm/instruction/Instruction";

type LoopKeyword = 'while' | 'until'
class Loop extends Tree {
  static count: number = 0;
  constructor(public keyword: LoopKeyword, public test: Tree, public block: Tree) {
    super();
  }
  inspect(): string {
    return this.keyword + "(" + this.test.inspect() + ") {" + this.block.inspect() + "}";
  }
  get code(): Code {
    // throw new Error("Loop.code -- Method not implemented.");
    let name = `loop-${Loop.count++}`;
    let prefix = (msg: string) => `${name}-${msg}`;
    let labelBegin = prefix('begin');
    let labelEnd = prefix('end');
    let flipTest: Code = this.keyword === 'while' ? [['dispatch', 'negate']] : [];
    return [
      ['label', labelBegin],
      ...this.test.code,
      ...flipTest,
      ['jump_if', labelEnd],
      // ['pop', null],
      ...this.block.code,
      ['jump', labelBegin],
      ['label', labelEnd],
      // ['pop', null],
    ]
  }
}

const self = new Bareword('self')

export const ast: { [key: string]: (...args: any[]) => Tree } = {
  Program: (list: Node, _delim: Node) =>
    new Program(list.tree),
  Funcall: (call: Node) =>
    new SendMethodCall(self, call.key.tree, call.args.tree),
  Defclass_plain: (_class: Node, name: Node, block: Node) =>
    new Defclass(name.tree, block.tree),
  Defclass_extends: (_class: Node, name: Node, superclass: Node, block: Node) =>
    new Defclass(name.tree, block.tree, superclass.tree),
  ClassName: (id: Node) => new Message(id.sourceString),
  ExtendsClass: (_extends: Node, name: Node) => name.tree,
  Defun: (name: Node, args: Node, block: Node) =>
    new Defun(name.tree, args.tree, block.tree),
  FunctionName: (id: Node) => new Message(id.sourceString),
  PipedBlock: (_lb: Node, pipeVars: Node, block: Node, _rb: Node) => {
    let pipe = pipeVars.tree[0] || new Sequence([]);
    return new PipedBlock(pipe, block.tree)
  },
  PipeVars: (_lp: Node, pipeVars: Node, _rp: Node) => pipeVars.tree,
  Arguments_block: (args: Node, block: Node) => {
    let argTree = args.tree[0] || new Sequence([]);
    return new Arguments(argTree, block.tree);
  },
  Arguments_no_block: (args: Node) => {
    if (args.tree instanceof Sequence) {
      return new Arguments(args.tree)
    } else {
      throw new Error("args tree was not sequence: " + args.tree)
    }
  },
  FormalArguments: (_lp: Node, args: Node, _rp: Node) => args.tree,
  Arg_ref: (_amp: Node, expr: Node) => new Argument(expr.tree, true),
  Arg: (expr: Node) => expr.tree instanceof Argument ? expr.tree : new Argument(expr.tree, false),
  Block: (_lb: Node, body: Node, _rb: Node) => body.tree,
  SendMessage_call: (receiver: Node, _dot: Node, message: Node, args: Node) => {
    let theArgs = args.tree;
    return new SendMethodCall(receiver.tree, message.tree, theArgs);
  },
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
  Param_ref: (_amp: Node, word: Node) => new Parameter((word.tree as Bareword).word, true),
  SendMessage_attr: (receiver: Node, _dot: Node, message: Node) =>
    new SendMessage(receiver.tree, message.tree),
  SendMessageEq_other: (receiver: Node, _dot: Node, message: Node, _eq: Node, expr: Node) =>
    new SendMessageEq(receiver.tree, message.tree, expr.tree),
  SendMessageEq_local: (message: Node, _eq: Node, expr: Node) =>
    new LocalVarSet(message.tree, expr.tree),
  Message: (contents: Node) => new Message(contents.sourceString),
  Bareword: (word: Node) => new Bareword(word.sourceString),
  Barecall: (word: Node, args: Node) => new Barecall(word.sourceString, args.tree),
  PriExpr_parens: (_lp: Node, expr: Node, _rp: Node) => expr.tree,
  PriExpr_neg: (_neg: Node, expr: Node) => new Negate(expr.tree),
  CmpExpr_eq: (left: Node, _eq: Node, right: Node) => new Compare('==', left.tree, right.tree),
  CmpExpr_neq: (left: Node, _eq: Node, right: Node) => new Compare('!=', left.tree, right.tree),
  CondStmt_ifThenElse: (_if: Node, cond: Node, _then: Node, left: Node, _else: Node, right: Node) =>
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
  
  FormalFunctionLiteral: (params: Node, _arrow: Node, block: Node) => new FunctionLiteral(params.tree, block.tree),
  StabbyFunctionLiteral: (_stab: Node, block: Node) => new FunctionLiteral(new Sequence([]), block.tree),
  StringLit: (_lq: Node, lit: Node, _rq: Node) => new StringLiteral(lit.sourceString),
  NumberLit: (digits: Node) => new NumberLiteral(Number(digits.sourceString)),
  NonemptyListOf: (eFirst: Node, _sep: any, eRest: Node) => new Sequence([eFirst.tree, ...eRest.tree]),
  EmptyListOf: () => new Sequence([]),
}