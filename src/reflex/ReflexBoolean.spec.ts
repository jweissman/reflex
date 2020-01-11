import { evaluate } from "./SpecHelper"

describe('Boolean', () => {
    it('is the class of truth-values', () => {
        expect(evaluate('Boolean')).toEqual("Class(Boolean)")
    })
    it('is a class', () => {
        expect(evaluate('Boolean.class')).toEqual("Class(Class)")
    })
    describe('Truth', () => {
        it('descends from boolean', () => expect(evaluate('Truth.isDescendantOf(Boolean)')).toEqual(true))
        describe('true', () => {
            it('is a Boolean', () => {
                expect(evaluate("true.class")).toEqual("Class(Truth)")
                expect(evaluate("true.class.super")).toEqual("Class(Boolean)")
            })
            it('has a positive truth-value', () => {
                expect(evaluate("true.true()")).toEqual(true)
                expect(evaluate("true.false()")).toEqual(false)
            })
            it('eq itself', () => {
                expect(evaluate("true.eq(true)")).toEqual(true)
                expect(evaluate("true.eq(false)")).toEqual(false)
            })
            it('neq false', () => {
                expect(evaluate("true.neq(true)")).toEqual(false)
                expect(evaluate("true.neq(false)")).toEqual(true)
            })
        })
        describe('truthiness', () => {
            it('nil, false and zero are not .true()', () =>{
                expect(evaluate("Object.true()")).toEqual(true)
                expect(evaluate("Object.new().true()")).toEqual(true)
                expect(evaluate("1.true()")).toEqual(true)
                expect(evaluate("0.true()")).toEqual(false)
                expect(evaluate("false.true()")).toEqual(false)
                expect(evaluate("nil.true()")).toEqual(false)
            })
        })
    })
    describe('Falsity', () => {
        it('descends from boolean', () => expect(evaluate('Falsity.isDescendantOf(Boolean)')).toEqual(true))
        describe('false', () => {
            it('is a Boolean', () => {
                expect(evaluate("false.class")).toEqual("Class(Falsity)")
                expect(evaluate("false.class.super")).toEqual("Class(Boolean)")
            })
            it('has a negative truth-value', () => {
                expect(evaluate("false.true()")).toEqual(false)
                expect(evaluate("false.false()")).toEqual(true)
            })
            it('convolutes', () => {
                expect(evaluate("false.false().false()")).toEqual(false)
            })
            it('eq itself', () => {
                expect(evaluate("false.eq(false)")).toEqual(true)
                expect(evaluate("false.eq(true)")).toEqual(false)
            })
            it('neq true', () => {
                expect(evaluate("false.neq(true)")).toEqual(true)
                expect(evaluate("false.neq(false)")).toEqual(false)
            })
        })
    })
})