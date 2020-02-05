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
        describe('eq', () => {
            it('compare elems', () => {
                expect(evaluate("[]==[]")).toEqual(true)
                expect(evaluate("[]==[1]")).toEqual(false)
                expect(evaluate("[1]==[1]")).toEqual(true)
                expect(evaluate("[2]==[1]")).toEqual(false)
                expect(evaluate("[1,2]==[1,2]")).toEqual(true)
                expect(evaluate("[1,2]==[2,1]")).toEqual(false)
                expect(evaluate("[1,2,3]==[1,2,3]")).toEqual(true)
                expect(evaluate("[1,2,3]==[1,3,2]")).toEqual(false)
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
            it('shorthand', () => {
                evaluate('arr=[1,2,3,4]')
                expect(evaluate('arr[0]')).toEqual(1)
                expect(evaluate('arr[1]')).toEqual(2)
                expect(evaluate('arr[2]')).toEqual(3)
                expect(evaluate('arr[3]')).toEqual(4)
                expect(evaluate('arr[4]')).toEqual(null)
            })
            it('shorthand index with lit', () => {
                expect(evaluate('[1,2,3][0]')).toEqual(1)
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
            it('shorthand', () => {
                evaluate('a=Array.new(1,2,3)')
                evaluate('a[0]=100')
                expect(evaluate("a")).toEqual([100,2,3])
            })
        })

        describe('push', () => {
            it('adds to end of array', () => {
                evaluate("arr = []")
                evaluate("arr.push(10)")
                expect(evaluate("arr")).toEqual([10])
                evaluate("arr.push(20)")
                expect(evaluate("arr")).toEqual([10,20])
                evaluate("arr.push(30)")
                expect(evaluate("arr")).toEqual([10,20,30])
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
                evaluate("a.withIndex { |v,i| x = x + v; y = y + i }")
                expect(evaluate('x')).toEqual(10+20+30+40)
                expect(evaluate('y')).toEqual(0+1+2+3)
            })
        })

        describe('map', () => {
            it('applies fn to each element', () => {
                expect(evaluate("[1,2,3,4,5].map{|v|v*2}.collect()")).toEqual([2,4,6,8,10])
                expect(evaluate("[1,2,4,8,16].map(&(v=>v*2)).collect()")).toEqual([2,4,8,16,32])
            })
            it('chains', () => {
                expect(evaluate("[1,2,3,4,5].map{|v|v*2}.map{|v|v-1}.collect()")).toEqual([1,3,5,7,9])
            })
            it('reverse map is map reverse', () => {
                evaluate('sq=x=>x*x')
                expect(
                    evaluate("[1,2,3,4,5].map(&sq).reverse().eq([1,2,3,4,5].reverse().map(&sq).collect())")
                ).toEqual(true)
            })
        })

        describe('reduce', () => {
            it('injects fn between elements', () => {
                expect(evaluate("[1,2,3,4,5].inject { |a,b| a+b }")).toEqual(1+2+3+4+5)
                expect(evaluate("[1,2,4,8,16].inject(&((a,b)=>a+b))")).toEqual(1+2+4+8+16)
            })
            it('injects by fn and name ref', () => {
                // really more about block semantics, could have tests there...?
                // this is the first place it really 'matters' though
                evaluate('plus(a,b) {a+b}')
                expect(evaluate("[1,2,4,8,16].inject &plus")).toEqual(1+2+4+8+16)
                expect(()=>evaluate("[1,2,4,8,16].inject &'add'")).toThrow() //toEqual(1+2+4+8+16)
                expect(()=>evaluate("[1,2,4,8,16].inject plus")).toThrow()
                expect(()=>evaluate("[1,2,4,8,16].inject 'add'")).toThrow()
            })

            test.todo('better failures for missing call/send refs')
        })

        describe('split', () => {
            it('decomposes an array', () => {
                expect(evaluate("[1,2,3,4,5].split 3")).toEqual([[1,2],[4,5]])
            })
            it('decomposes an array with a block', () => {
                expect(evaluate("[1,2,3,4,5].split { |x| x%2==0 }")).toEqual([[1],[3],[5]])
            })
        })

        describe('join', () => {
            it('injects composition', () => {
                expect(evaluate("'hello'.toArray().join()")).toEqual("hello")
                expect(evaluate("'hello'.toArray().join()")).toEqual("hello")
            })

            it('is inverse to split on empty string', () => {
                expect(evaluate("'hello'.split('').join()")).toEqual("hello")
                expect(evaluate("'hello'.split('').join()")).toEqual("hello")
            })

            it('inserts delim', () => {
                expect(evaluate("['hi', 'there'].join(' ')")).toEqual("hi there")
            })
        })

        describe('select', () => {
            it('finds elements matching predicate', () => {
                expect(evaluate("[1,2,3].select { |x| x%2==0 }")).toEqual([2])
                // expect(evaluate("[1,2,3]==[1,2,3]")).toEqual(false)
            })
        })

        describe('includes', () => {
            it('returns true if any element matches', () => {
                expect(evaluate("[1,2,3].includes(1)")).toEqual(true)
                expect(evaluate("[1,2,3].includes(2)")).toEqual(true)
                expect(evaluate("[1,2,3].includes(3)")).toEqual(true)
                expect(evaluate("[1,2,3].includes(4)")).toEqual(false)
            })
        })

        describe('subtract', () => {
            it('removes all elements matching any element in other array', () => {
                expect(evaluate("[1,2,3]-[2]")).toEqual([1,3])
                expect(evaluate("[1,2,3,4,5]-[1,5]")).toEqual([2,3,4])
            })
        })

        describe('zip', () => {
            it('joins two arrays', () => {
                expect(evaluate("[1,2,3].zip(['a','b','c'])")).toEqual([[1,'a'],[2,'b'],[3,'c']])
            })
        })
    })

    it('literals', () => {
        expect(evaluate("[1,2,3]")).toEqual([1,2,3])
        expect(evaluate("[1,2,4,8,16,32,64,128,256]")).toEqual([1,2,4,8,16,32,64,128,256])
    })

})
