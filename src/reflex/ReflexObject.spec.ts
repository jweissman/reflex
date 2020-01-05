import { evaluate } from "./SpecHelper";

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

    describe("meta", () => {
        it('is the eigenobject', () => {
            evaluate("o=Object.new()")
            evaluate("o.meta.defineMethod('bar') { Function }")
            expect(evaluate("o.bar()")).toEqual("Class(Function)")
            expect(() => evaluate("Object.new().bar()")).toThrow()
        })
    })

    describe("#instanceEval", () => {
        it('evaluates a block as self', () => {
            evaluate("o=Object.new()")
            expect(evaluate("o.instanceEval { self }")).toEqual("Object")
            expect(evaluate("o.instanceEval { self.x = Function }; o.x")).toEqual("Class(Function)")
        })

        // again just a sanity check, could be pruned
        it('does not trash frame self', () => {
            evaluate("o=Object.new()")
            expect(evaluate("self")).toEqual("Main")
            expect(evaluate("o.instanceEval { self }")).toEqual("Object")
            expect(evaluate("self")).toEqual("Main")
            expect(evaluate("o.instanceEval { self.x = Function }; o.x")).toEqual("Class(Function)")
            expect(evaluate("self")).toEqual("Main")
        })
    })
});