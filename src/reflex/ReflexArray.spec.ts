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

        describe('eachWithIndex', () => {
            it('runs on empty', () => {
                expect(()=>evaluate("[].eachWithIndex{}")).not.toThrow()
            })
            it('runs on one element', () => {
                expect(()=>evaluate("[1].eachWithIndex{}")).not.toThrow()
            })
            it('iterates over list items', () => {
                evaluate('a=Array.new(10,20,30,40)')
                evaluate('x=0')
                evaluate('y=0')
                evaluate("a.eachWithIndex { |v,i| x = x + v; y = y + i }")
                expect(evaluate('x')).toEqual(10+20+30+40)
                expect(evaluate('y')).toEqual(0+1+2+3)
            })
        })

        describe('map', () => {
            it('applies fn to each element', () => {
                expect(evaluate("[1,2,3,4,5].map{|v|v*2}")).toEqual([2,4,6,8,10])
                expect(evaluate("[1,2,4,8,16].map(v=>v*2)")).toEqual([2,4,8,16,32])
            })
        })

        describe('reduce', () => {
            it('injects fn between elements', () => {
                expect(evaluate("[1,2,3,4,5].inject { |a,b| a+b }")).toEqual(1+2+3+4+5)
                expect(evaluate("[1,2,4,8,16].inject((a,b)=>a+b)")).toEqual(1+2+4+8+16)

                expect(evaluate("[1,2,4,8,16].inject &'add'")).toEqual(1+2+4+8+16)
                // expect(()=>evaluate("[1,2,4,8,16].inject 'add'")).toThrow()
            })
        })

        describe('split', () => {
            it('decomposes an array', () => {
                expect(evaluate("[1,2,3,4,5].split 3")).toEqual([[1,2],[4,5]])
            })
            it('decomposes an array with a block', () => {
                expect(evaluate("[1,2,3,4,5].split { |x| x%2==0 }")).toEqual([[1],[3],[5]])
            })
        })
    })

    it('literals', () => {
        expect(evaluate("[1,2,3]")).toEqual([1,2,3])
        expect(evaluate("[1,2,4,8,16,32,64,128,256]")).toEqual([1,2,4,8,16,32,64,128,256])
    })

})
