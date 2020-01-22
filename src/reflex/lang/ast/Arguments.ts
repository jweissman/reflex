import util from 'util';
import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from "../../vm/instruction/Instruction";
import { PipedBlock } from "./PipedBlock";
import { log } from "../../vm/util/log";

export class Argument extends Tree {
  constructor(public value: Tree, public isReference: boolean = false) { super();}
  inspect(): string {
    if (this.isReference) {
      // log("MADE REF ARG: &"  + this.value)
      return "&" + this.value.inspect();
    } else {
      // log("MADE ARG: "  + this.value)
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
    // if (this.block) {
    //   log("MAKE ARGS W BLOCK! " + this.inspect());
    // } else {
    //   log("MAKE ARGS W/O BLOCK! " + this);
    // }
    // log("MADE ARGS: " + this.inspect())
  }

  static from(args: Sequence<Argument> | Arguments | Argument | PipedBlock | Array<Tree>, block?: PipedBlock | Argument) {
    // log("ARGS FROM: args --" + util.inspect(args))
    // if (block) {
    //   log("ARGS FROM: block --" + block.inspect())
    // }
    // let { tree } = args;
    if (args instanceof Sequence) {
      // log("ARGS WAS SEQ: " + args.inspect())
      if (block) {
        // log("ARGS WAS SEQ WITH BLOCK: " + block.inspect())
        return new Arguments(args, block)
      } else {
        // log("ARGS WAS SEQ WITHOUT: " + args.inspect())
        return new Arguments(args)

      }
    } else if (args instanceof Arguments) {
      // log("WAS ALREADY ARGS: " + args.inspect())
      if (block) {
        // log("ADD BLOCK: " + block.inspect())
        args.block = block;
      }
      return args;
    } else if (args instanceof PipedBlock) {
      // log("ARGS WAS BLOCK: " + args.inspect())
      return new Arguments(new Sequence([]), args)
    } else if (args instanceof Argument) {
      // log("ARGS WAS ARG: " + args.inspect())
      if (args.isReference) {
        // log("ARGS WAS REF!: " + args.inspect())
        return new Arguments(new Sequence([args]))
      } else {
        // log("ARGS WAS NORMAL ARG, BUT HAS BLOCK: " + args.inspect())
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
    return new Arguments(this.args.reverse(), this.block)
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
    if (this.block && this.block instanceof Tree) {
      return [
        ...this.block.code,
        ...this.args.code,
      ];
    }
    else {
      return [
        ...this.args.code,
      ];
    }
  }
}
