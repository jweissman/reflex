import { evaluate } from "./SpecHelper"

describe('Function', () => {
    it('is the class of Functions', () => {
        expect(evaluate("Function")).toEqual("Class(Function)")
    })
    it('is a class', () => {
        expect(evaluate("Function.class")).toEqual("Class(Class)")
    })
    it('has object as supertype', () => {
        expect(evaluate("Function.super")).toEqual("Class(Object)")
    })
    it('creates functions', () => {
        expect(evaluate("foo() { Object }")).toEqual("Function(foo)")
    });
    it('invokes functions', () => {
        expect(evaluate("foo() { Object }")).toEqual("Function(foo)")
        expect(evaluate("foo()")).toEqual("Class(Object)")
    })
    it('creates lambdas', () => {
        expect(evaluate("()=>{Object}")).toMatch(/Function\(lambda-\d+\)/)
    });
    it('invokes lambdas', () => {
        expect(evaluate("f=()=>{Object}")).toMatch(/Function\(lambda-\d+\)/)
        expect(evaluate("f()")).toEqual("Class(Object)")
    });
    describe('.new', () => {
        it('returns its arg', () => {
            expect(evaluate("fn=Function.new(()=>{Class})")).toMatch("Function")
            expect(evaluate("fn.class")).toMatch("Class(Function)")
            expect(evaluate("fn()")).toMatch("Class(Class)")
        })
    })
    it('binds locals', () => {
        expect(evaluate("class A{bar(){b=self;()=>{b}}}")).toEqual("Class(A)")
        expect(evaluate("baz=A.new()")).toEqual("A")
        expect(evaluate("fn=baz.bar()")).toMatch("Function")
        expect(evaluate("fn()")).toMatch("A")

        expect(evaluate("class A{quux(){()=>{self}}}")).toEqual("Class(A)")
        expect(evaluate("fn=baz.quux()")).toMatch("Function")
        expect(evaluate("fn()")).toMatch("A")
    })
    it('higher-order', () => {
        evaluate('parent=(klass)=>klass.super')
        evaluate('twice=(f)=>(x)=>f(f(x))')
        evaluate('grandparent=twice parent')
        expect(evaluate('grandparent(Object)')).toEqual("Class(Object)")
        expect(evaluate('grandparent(Function)')).toEqual("Class(Object)")
        expect(evaluate('grandparent(Class)')).toEqual("Class(Object)")
        expect(evaluate('grandparent(Class.new("Bar"))')).toEqual("Class(Object)")
        expect(evaluate('grandparent(Class.new("Bar", Class.new("Baz")))')).toEqual("Class(Object)")
        expect(evaluate('grandparent(Class.new("Bar", Class.new("Baz", Class.new("Quux"))))')).toEqual("Class(Quux)")
    })
})