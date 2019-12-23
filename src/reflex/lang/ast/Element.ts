import { Code } from '../../vm/Instruction';

import Tree from './Tree';
// a structural element, which doesn't matter for codegen
export class Element extends Tree {
    code!: Code;
    constructor(public it: Tree) {
        super();
        this.code = it.code;
    }
    inspect() { return this.it.inspect() }
}
