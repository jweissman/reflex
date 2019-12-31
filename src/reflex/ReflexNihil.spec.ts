import { evaluate } from "./SpecHelper"

describe('Nihil', () => {
    it('is the empty class (uninhabited type)', () => {
        expect(evaluate("Nihil")).toEqual("Class(Nihil)")
    })
    it('is a class', () => {
        expect(evaluate("Nihil.class")).toEqual("Class(Class)")
    })
    it('is an object', () => {
        expect(evaluate("Nihil.super")).toEqual("Class(Object)")
    })

    describe('"nil" literal', () => {
        it('is a Nihil value', () => {
            expect(evaluate("nil")).toEqual("Nihil")
        })

        it('is of class Nihil', () => {
            expect(evaluate("nil.class")).toEqual("Class(Nihil)")
        })
    })

    it('is the return value of an empty function', () => {
        expect(evaluate("f(){};f()")).toEqual("Nihil")
    })

    it("is the piped value of an exhausted generator", () => {
        evaluate("x=Function")
        evaluate("g=()=>{}")
        evaluate("g { |v| x=v }")
        expect(evaluate("x")).toEqual("Nihil")
        evaluate("gen=()=>{yield Object}")
        evaluate("gen { |v| x=v }")
        expect(evaluate("x")).toEqual("Class(Object)")
    })
})