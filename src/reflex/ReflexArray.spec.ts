import { evaluate } from "./SpecHelper"

describe('Array', () => {
    it('is the class of indexed object lists', () => {
        expect(evaluate("Array")).toEqual("Class(Array)")
        expect(evaluate("Array.class")).toEqual("Class(Class)")
    })

    describe('new', () => {
        it('creates a list of items', () => {
            expect(evaluate("Array.new()")).toEqual("[]")
            expect(evaluate("Array.new(1)")).toEqual("[1]")
            expect(evaluate("Array.new(1,Object.new(),()=>3)")).toEqual("[1,Object,->3]")
            expect(evaluate("Array.new(1,2,3,4,5)")).toEqual("[1,2,3,4,5]")
        })
    })

    describe('instance methods', () => {
        describe('length', () => {
            it('counts list items', () => {
                expect(evaluate("Array.new(1,2,3,4,5).length()")).toEqual(5)
            })
        })
        describe('get', () => {
            it('indexes into list items', () => {
                evaluate('a=Array.new(1,2,3)')
                expect(evaluate("a.get(0)")).toEqual(1)
                expect(evaluate("a.get(1)")).toEqual(2)
                expect(evaluate("a.get(2)")).toEqual(3)
                expect(evaluate("a.get(3)")).toEqual(null)
            })
        })

        describe('set', () => {
            it('updates list items', () => {
                evaluate('a=Array.new(1,2,3)')
                evaluate("a.set(0,5)")
                expect(evaluate("a")).toEqual("[5,2,3]")
                evaluate("a.set(1,6)")
                expect(evaluate("a")).toEqual("[5,6,3]")
                evaluate("a.set(2,7)")
                expect(evaluate("a")).toEqual("[5,6,7]")
                evaluate("a.set(3,8)")
                expect(evaluate("a")).toEqual("[5,6,7,8]")
            })
        })

        describe('each', () => {
            xit('iterates over list items', () => {
                evaluate('a=Array.new(1,2,3)')
                evaluate('x=0')
                evaluate("a.each { |v| x = x + v }")
                expect(evaluate('x')).toEqual(6)
            })
        })
    })

    it('literals', () => {
        expect(evaluate("[1,2,3]")).toEqual("[1,2,3]")
    })

})
