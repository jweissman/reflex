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

const self = new Bareword('self')

export const ast: { [key: string]: (...args: any[]) => Tree } = {
    Program: (list: Node, _delim: Node) =>
      new Program(list.tree),
    Funcall: (message: Node, args: Node) =>
        new SendMethodCall(self, message.tree, args.tree),
    Defun: (name: Node, args: Node, block: Node) =>
      new Defun(name.tree, args.tree, block.tree),
    FunctionName: (id: Node) => new Message(id.sourceString),
    Args: (_lp: Node, args: Node, _rp: Node) => args.tree,
    Block: (_lb: Node, body: Node, _rb: Node) => body.tree,
    SendMessage_call: (receiver: Node, _dot: Node, message: Node, args: Node) =>
      new SendMethodCall(receiver.tree, message.tree, args.tree),
    Params: (_lp: Node, paramList: Node, _rp: Node) =>
      new Sequence([paramList.tree]),
    SendMessage_attr: (receiver: Node, _dot: Node, message: Node) =>
      new SendMessage(receiver.tree, message.tree),
    SendMessageEq_self: (message: Node, _eq: Node, expr: Node) =>
      new SendMessageEq(message.tree, expr.tree),
    Message: (contents: Node) => new Message(contents.sourceString),
    Bareword: (word: Node) => new Bareword(word.sourceString),
    FunctionLit: (params: Node, _arrow: Node, block: Node) => new FunctionLiteral(params.tree, block.tree),
    StringLit: (_lq:Node, lit: Node,_rq: Node) => new StringLiteral(lit.sourceString),
    NonemptyListOf: (eFirst: Node, _sep: any, eRest: Node) => new Sequence([eFirst.tree, ...eRest.tree]),
    EmptyListOf: () => new Sequence([]),
}