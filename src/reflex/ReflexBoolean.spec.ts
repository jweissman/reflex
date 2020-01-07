import { evaluate } from "./SpecHelper"

describe('Boolean', () => {
    it('is the class of truth-values', () => {
        expect(evaluate('Boolean')).toEqual("Class(Boolean)")
    })
    it('is a class', () => {
        expect(evaluate('Boolean.class')).toEqual("Class(Class)")
    })
    describe('Truth', () => {
        it('descends from boolean', () => expect(evaluate('Truth.isDescendantOf(Boolean)')).toEqual('Truth'))
    })
    describe('Falsity', () => {
        it('descends from boolean', () => expect(evaluate('Falsity.isDescendantOf(Boolean)')).toEqual('Truth'))
    })
    describe('true', () => {
        it('is a Boolean', () => {
            expect(evaluate("true.class")).toEqual("Class(Truth)")
            expect(evaluate("true.class.super")).toEqual("Class(Boolean)")
        })
        it('has a positive truth-value', () => {
            expect(evaluate("true.true()")).toEqual("Truth")
            expect(evaluate("true.false()")).toEqual("Falsity")
        })
        it('eq itself', () => {
            expect(evaluate("true.eq(true)")).toEqual("Truth")
            expect(evaluate("true.eq(false)")).toEqual("Falsity")
        })
        it('neq false', () => {
            expect(evaluate("true.neq(true)")).toEqual("Falsity")
            expect(evaluate("true.neq(false)")).toEqual("Truth")
        })
    })
    describe('false', () => {
        it('is a Boolean', () => {
            expect(evaluate("false.class")).toEqual("Class(Falsity)")
            expect(evaluate("false.class.super")).toEqual("Class(Boolean)")
        })
        it('has a negative truth-value', () => {
            expect(evaluate("false.true()")).toEqual("Falsity")
            expect(evaluate("false.false()")).toEqual("Truth")
        })
        it('eq itself', () => {
            expect(evaluate("false.eq(false)")).toEqual("Truth")
            expect(evaluate("false.eq(true)")).toEqual("Falsity")
        })
        it('neq true', () => {
            expect(evaluate("false.neq(true)")).toEqual("Truth")
            expect(evaluate("false.neq(false)")).toEqual("Falsity")
        })
    })
})
