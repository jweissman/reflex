import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from "../../vm/instruction/Instruction";
import { PipedBlock } from "./PipedBlock";
export class Arguments extends Tree {
  constructor(public args: Sequence, public block?: PipedBlock) {
    super();
    // console.log("CREATE ARGUMENTS", { args, block }); 
  }
  inspect(): string {
    let disp = this.args.inspect();
    if (this.block && this.block instanceof PipedBlock) {
      disp += this.block.inspect();
    }
    return disp;
  }
  get code(): Code {
    if (this.block && this.block instanceof PipedBlock) {
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
