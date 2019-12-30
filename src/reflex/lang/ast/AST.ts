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
import { Code } from "../../vm/instruction/Instruction";
import { log } from "../../vm/util/log";

const self = new Bareword('self')

class PipedBlock extends Tree {
  constructor(public pipeVars: Sequence, public body: Program) {
    super();
  }
  inspect(): string {
    return `{|${this.pipeVars.inspect()}| ${this.body.inspect()}}`
  }
  get code(): Code {
    return [
      ['compile', new FunctionLiteral(this.pipeVars, this.body)]
    ]
    // throw new Error("PipedBlock.code -- Method not implemented.");
  }
}

class Arguments extends Tree {
  constructor(public args: Sequence, public block?: PipedBlock) {
    super();
    log("CREATE ARGS: " + args.inspect())
    if (this.block && this.block instanceof PipedBlock) {
      log("!!! CREATE ARGS WITH BLOCK: " + this.block.inspect())
    }
  }
  inspect(): string { 
    let disp = this.args.inspect() 
    if (this.block && this.block instanceof PipedBlock) {
    disp += this.block.inspect() 
    }
    return disp;
  }
  get code(): Code {
    if (this.block && this.block instanceof PipedBlock) {
      return [
        ...this.args.code,
        ...this.block.code,
      ];
    } else {
      return [
        // ...(this.block !== undefined && this.block.code.length ? this.block.code : []), //this.block.code : []),
        ...this.args.code,
      ];
    }
  }
}

export const ast: { [key: string]: (...args: any[]) => Tree } = {
  Program: (list: Node, _delim: Node) =>
    new Program(list.tree),
  Funcall: (call: Node) => //message: Node, args: Node) =>
    new SendMethodCall(self, call.key.tree, call.args.tree),
  Defclass: (_class: Node, name: Node, block: Node) =>
    new Defclass(name.tree, block.tree),
  ClassName: (id: Node) => new Message(id.sourceString),
  Defun: (_def: Node, name: Node, args: Node, block: Node) =>
    new Defun(name.tree, args.tree, block.tree),
  FunctionName: (id: Node) => new Message(id.sourceString),
  PipedBlock: (_lb: Node, pipeVars: Node, block: Node, _rb: Node) =>
    new PipedBlock(pipeVars.tree, block.tree),
  PipeVars: (_lp: Node, pipeVars: Node, _rp: Node) => pipeVars.tree,
  Arguments_block: (args: Node, block: Node) => new Arguments(args.tree, block.tree),
  Arguments_no_block: (args: Node) => new Arguments(args.tree),
  FormalArguments: (_lp: Node, args: Node, _rp: Node) => args.tree,
  Block: (_lb: Node, body: Node, _rb: Node) => body.tree,
  SendMessage_call: (receiver: Node, _dot: Node, message: Node, args: Node) =>
    new SendMethodCall(receiver.tree, message.tree, args.tree),
  FormalParams: (_lp: Node, paramList: Node, _rp: Node) => paramList.tree,
  // new Sequence([paramList.tree]),
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