import { evaluate } from "./SpecHelper";
import { isRegExp } from "util";

describe('Object', () => {
    it('is a class', () => {
        expect(evaluate("Object.class")).toEqual("Class(Class)")
    });
    it('is the class of Objects', () => {
        expect(evaluate("Object")).toEqual("Class(Object)")
    });
    it('is its own supertype', () => {
        expect(evaluate("Object.super")).toEqual("Class(Object)")
    })
    
    describe(".new", () => {
        it('is a Function', () => {
            expect(evaluate("Object.new")).toEqual("Function(Object.new[wrap])")
        })
        it('constructs new Object', () => {
            expect(evaluate("Object.new()")).toEqual("Object")
        })
        it('constructed Objects have Object as class', () => {
            expect(evaluate("Object.new().class")).toEqual("Class(Object)")
        })
        it('constructed objects have a class that is a class', () => {
            expect(evaluate("Object.new().class.class")).toEqual("Class(Class)")
        })
    });

    describe('#methods()', () => {
        test.todo("once we have lists and strings/symbols...")
    })

    describe("members", () => {
        it('direct write access is disallowed outside self', () => {
            evaluate("o=Object.new()")
            expect(()=>evaluate("o.x=Function")).toThrow()
        })

        test.todo("direct read access is disallowed outside self")
    })

    describe("#instanceEval", () => {
        it('evaluates a block as self', () => {
            evaluate("o=Object.new()")
            expect(evaluate("o.instanceEval { self }")).toEqual("Object")
            expect(evaluate("o.instanceEval { self.x = Function }; o.x")).toEqual("Class(Function)")
        })

        it('has access to eigenobject', () => {
            evaluate("o=Object.new()")
            evaluate("o.meta.defineMethod('bar') { Function }")
            // evaluate("o.instanceEval { meta.defineMethod('bar') { Function } }")
            expect(evaluate("o.bar()")).toEqual("Class(Function)")
        })
    })
});