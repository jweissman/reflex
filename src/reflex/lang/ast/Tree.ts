import { Code } from '../../vm/Instruction'

abstract class Tree {
    abstract inspect(): string;
    abstract get code(): Code;
    toString() { return this.inspect()}
}

export default Tree;
