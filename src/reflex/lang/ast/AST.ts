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
import { Arguments } from "./Arguments";
import { Code } from "../../vm/instruction/Instruction";

export class Parameter extends Tree {
  constructor(public name: string, public reference: boolean = false) {
    super();
    // console.log("CREATE NEW PARAMETER " + name + " -- ref? " + reference)
  }

  inspect(): string {
    return this.reference ? `&${this.name}` : this.name;
  }

  get code(): Code {
    return [[ 'bare', this.name ]]
  }
}

const self = new Bareword('self')

export const ast: { [key: string]: (...args: any[]) => Tree } = {
  Program: (list: Node, _delim: Node) =>
    new Program(list.tree),
  Funcall: (call: Node) =>
    new SendMethodCall(self, call.key.tree, call.args.tree),
  Defclass: (_class: Node, name: Node, block: Node) =>
    new Defclass(name.tree, block.tree),
  ClassName: (id: Node) => new Message(id.sourceString),
  Defun: (_def: Node, name: Node, args: Node, block: Node) =>
    new Defun(name.tree, args.tree, block.tree),
  FunctionName: (id: Node) => new Message(id.sourceString),
  PipedBlock: (_lb: Node, pipeVars: Node, block: Node, _rb: Node) => {
    let pipe = pipeVars.tree[0] || new Sequence([]);
    return new PipedBlock(pipe, block.tree)
  },
  PipeVars: (_lp: Node, pipeVars: Node, _rp: Node) => pipeVars.tree,

  Arguments_block: (args: Node, block: Node) => {
    let argTree = args.tree[0] || new Sequence([]);
    // console.log("Create arg with block", { argTree, block: block.tree })
    return new Arguments(argTree, block.tree);
  },
  Arguments_no_block: (args: Node) => {
    // if (args.tree instanceof Arguments) {
      // return args.tree;
    // } else
    if (args.tree instanceof Sequence) {
      return new Arguments(args.tree)
    } else {
      throw new Error("args tree was not sequence: " + args.tree)
    }
  },
  FormalArguments: (_lp: Node, args: Node, _rp: Node) => args.tree,
  Block: (_lb: Node, body: Node, _rb: Node) => body.tree,

  SendMessage_call: (receiver: Node, _dot: Node, message: Node, args: Node) => {
    let theArgs = args.tree;
    return new SendMethodCall(receiver.tree, message.tree, theArgs);
  },
  FormalParams: (_lp: Node, paramList: Node, _rp: Node) => paramList.tree,
  Param: (parameter: Node) => {
    if (parameter.tree instanceof Bareword) {
      return new Parameter((parameter.tree as Bareword).word)
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
  FunctionLit: (params: Node, _arrow: Node, block: Node) => new FunctionLiteral(params.tree, block.tree),
  StringLit: (_lq: Node, lit: Node, _rq: Node) => new StringLiteral(lit.sourceString),
  NonemptyListOf: (eFirst: Node, _sep: any, eRest: Node) => new Sequence([eFirst.tree, ...eRest.tree]),
  EmptyListOf: () => new Sequence([]),
}