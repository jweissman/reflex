import { evaluate } from "./SpecHelper"

describe('Array', () => {
    it('is the class of indexed object lists', () => {
        expect(evaluate("Array")).toEqual("Class(Array)")
        expect(evaluate("Array.class")).toEqual("Class(Class)")
    })

    describe('new', () => {
        it('creates a list of items', () => {
            expect(evaluate("Array.new()")).toEqual([])
            expect(evaluate("Array.new(1)")).toEqual([1])
            // expect(evaluate("Array.new(1,Object.new(),()=>3)")).toEqual([1,"Object","->3"])
            expect(evaluate("Array.new(1,2,3,4,5)")).toEqual([1,2,3,4,5])
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
                expect(evaluate("a")).toEqual([5,2,3])
                evaluate("a.set(1,6)")
                expect(evaluate("a")).toEqual([5,6,3])
                evaluate("a.set(2,7)")
                expect(evaluate("a")).toEqual([5,6,7])
                evaluate("a.set(3,8)")
                expect(evaluate("a")).toEqual([5,6,7,8])
            })
        })

        describe('concat', () => {
           it('welds arrays', () => {
                evaluate('a=[1,2];b=[3,4,5]')
                expect(evaluate("a+b")).toEqual([1,2,3,4,5])
            })
        })

        describe('each', () => {
            it('runs on empty', () => {
                expect(()=>evaluate("[].each{}")).not.toThrow()
            })
            it('runs on one element', () => {
                expect(()=>evaluate("[1].each{}")).not.toThrow()
            })
            it('iterates over list items', () => {
                evaluate('a=Array.new(1,2,3)')
                evaluate('x=0')
                evaluate("a.each { |v| x = x + v }")
                expect(evaluate('x')).toEqual(6)
            })
        })

        describe('map', () => {
            it('applies fn to each element', () => {
                expect(evaluate("[1,2,3,4,5].map{|v|v*2}")).toEqual([2,4,6,8,10])
                expect(evaluate("[1,2,4,8,16].map(v=>v*2)")).toEqual([2,4,8,16,32])
            })
        })
    })

    it('literals', () => {
        expect(evaluate("[1,2,3]")).toEqual([1,2,3])
        expect(evaluate("[1,2,4,8,16,32,64,128,256]")).toEqual([1,2,4,8,16,32,64,128,256])
    })

})