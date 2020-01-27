import util from 'util';
import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from "../../vm/instruction/Instruction";
import { PipedBlock } from "./PipedBlock";

export class Argument extends Tree {
  constructor(public value: Tree, public isReference: boolean = false) { super();}
  inspect(): string {
    if (this.isReference) {
      return "&" + this.value.inspect();
    } else {
      return this.value.inspect();
    }
  }
  get code(): Code {
    return this.value.code;
  }
}

export class Arguments extends Tree {
  constructor(public args: Sequence<Argument>, public block?: PipedBlock | Argument) {
    super();
    if (!block) {
      // log("NO BLOCK... CHECKING FOR BLOCK ARG")
      let blockArg = this.args.items.find((arg: Argument) => arg.isReference)
      if (blockArg) {
        this.block = blockArg;
        // log("REMOVING ITEMS FROM ARGS... -- len before: " + this.args.length)
        this.args.items = this.args.items.filter(arg => !arg.isReference)
        // log("REMOVED ITEMS FROM ARGS... -- len after: " + this.args.length)
      }
    }

    this.args = this.args.reverse()
  }

  static from(args: Sequence<Argument> | Arguments | Argument | PipedBlock | Array<Tree>, block?: PipedBlock | Argument) {
    if (args instanceof Sequence) {
      if (block) {
        return new Arguments(args, block)
      } else {
        return new Arguments(args)
      }
    } else if (args instanceof Arguments) {
      if (block) {
        args.block = block;
      }
      return args;
    } else if (args instanceof PipedBlock) {
      return new Arguments(new Sequence([]), args)
    } else if (args instanceof Argument) {
      if (args.isReference) {
        return new Arguments(new Sequence([args]))
      } else {
        return new Arguments(new Sequence([args]), block)
      }
    } else if (Array.isArray(args)) { //} && args.length === 0) {
        // log("ARGS WAS ARRAY: " + args.map(arg => arg.inspect))
      return new Arguments(new Sequence(args as Array<Argument>), block)
    } else {
      throw new Error("args tree was unexpected: " + util.inspect(args as any))
    }
  }

  get length() { return this.args.length}

  reverse() {
    if (this.block) {
      return new Arguments(this.args.reverse(), this.block)
    } else {
      return new Arguments(this.args.reverse())
    }
  }

  inspect(): string {
    let disp = this.args.inspect();
    if (this.block && this.block instanceof Tree) {
      disp += '{' + this.block.inspect() + '}';
    } else {
      // disp += "[no-block]"
    }
    return disp;
  }

  get code(): Code {
    let listing: Code = []
    if (this.block && this.block instanceof Tree) {
      listing = [
        ...this.block.code,
        ...this.args.code,
      ];
    }
    else {
      listing = [
        ...this.args.code,
      ];
    }
    return [
      ['mark', 'arg-list'],
      ...listing,
      ['gather', 'arg-list'],
    ]
  }
}
