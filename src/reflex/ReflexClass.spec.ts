import { evaluate } from "./SpecHelper";

describe('Class', () => {
    it('is the class of Classes', () => {
        expect(evaluate("Class")).toEqual("Class(Class)")
    })
    it('is a class', () => {
        expect(evaluate("Class.class")).toEqual("Class(Class)")
    })
    it('has object as supertype', () => {
        expect(evaluate("Class.super")).toEqual("Class(Object)")
    })

    describe(".new", () => {
        it('is a Function', () => {
            expect(evaluate("Class.new")).toEqual("Function(Class.new[wrap])")
        })
        it('is a class factory', () => {
            expect(evaluate("Class.new()")).toEqual("Class(Anonymous)")
        });
        it('new classes are classes', () => {
            expect(evaluate("Class.new().class")).toEqual("Class(Class)")
        })
        it('new classes are subclasses of Object', () => {
            expect(evaluate("Class.new().super")).toEqual("Class(Object)")
        })

        describe('subclassing', () => {
            it('builds a class', () => {
                expect(evaluate("Class.new('Bar').class")).toEqual("Class(Class)")
            })
            it('builds a class by name', () => {
                expect(evaluate("Class.new('Bar')")).toEqual("Class(Bar)")
            });
            it('descends from Object by default', () => {
                expect(evaluate("Class.new('Bar').super")).toEqual("Class(Object)")
            });
            it('constructs a built class', () => {
                expect(evaluate("Class.new('Bar').new()")).toEqual("Bar")
            });

            it('builds a subclass descending from a specific class', () => {
                expect(evaluate("Baz=Class.new('Baz')")).toEqual("Class(Baz)")
                expect(evaluate("Bar=Class.new('Bar', Baz)")).toEqual("Class(Bar)")
                expect(evaluate("Bar.super")).toEqual("Class(Baz)")
                expect(evaluate("Bar.super.super")).toEqual("Class(Object)")
                expect(evaluate("Bar.super.super.super")).toEqual("Class(Object)")
            });
        });
    });

    describe('instance methods', () => {
        it('defines an instance method', () => {
            expect(evaluate("o=Object.new()")).toEqual("Object")
            expect(evaluate("Object.defineMethod('baz', () => { Function })")).toEqual("Function(Object.baz)")
            expect(evaluate("o.baz")).toEqual("Function(Object.baz)")
            expect(evaluate("o.baz()")).toEqual("Class(Function)")
            expect(evaluate("o2=Object.new()")).toEqual("Object")
            expect(evaluate("o2.baz")).toEqual("Function(Object.baz)")
            expect(evaluate("o2.baz()")).toEqual("Class(Function)")
        })

        it('redefines an instance method', () => {
            expect(evaluate("o=Object.new()")).toEqual("Object")
            expect(evaluate("Object.defineMethod('baz', () => { Class })")).toEqual("Function(Object.baz)")
            expect(evaluate("o.baz")).toEqual("Function(Object.baz)")
            expect(evaluate("o.baz()")).toEqual("Class(Class)")
            expect(evaluate("o2=Object.new()")).toEqual("Object")
            expect(evaluate("o2.baz")).toEqual("Function(Object.baz)")
            expect(evaluate("o2.baz()")).toEqual("Class(Class)")
        })

        it('extends Object', () => {
            expect(evaluate("Class.new('Bar').super")).toEqual("Class(Object)")
            expect(evaluate("Bar=Class.new('Bar')")).toEqual("Class(Bar)")
            expect(evaluate("Bar.super")).toEqual("Class(Object)")
            expect(evaluate("Bar.new().class.super")).toEqual("Class(Object)")
        })

        it('inherits instance methods', () => {
            expect(evaluate("o=Object.new()")).toEqual("Object")
            expect(evaluate("Object.defineMethod('quux', () => { Function })")).toEqual("Function(Object.quux)")
            expect(evaluate('o.quux')).toEqual('Function(Object.quux)')
            expect(evaluate('o.quux()')).toEqual('Class(Function)')

            expect(evaluate("Bar=Class.new('Bar')")).toEqual("Class(Bar)")
            expect(evaluate("Bar.super")).toEqual("Class(Object)")
            expect(evaluate('bar=Bar.new()')).toEqual('Bar')
            expect(evaluate('bar.quux')).toEqual('Function(Object.quux)')
            expect(evaluate('bar.quux()')).toEqual('Class(Function)')

            expect(evaluate("Baz=Class.new('Baz', Bar)")).toEqual("Class(Baz)")
            expect(evaluate("Baz.super")).toEqual("Class(Bar)")
            expect(evaluate('baz=Baz.new()')).toEqual('Baz')
            expect(evaluate('baz.quux')).toEqual('Function(Object.quux)')
            expect(evaluate('baz.quux()')).toEqual('Class(Function)')
        })

        it('may set a value', () => {
            expect(evaluate("Object.defineMethod('yep', () => { self.kind = Function })")).toEqual("Function(Object.yep)")
            evaluate("o=Object.new()")
            expect(evaluate("o.yep")).toEqual("Function(Object.yep)")
            evaluate("o.yep()")
            expect(evaluate("o.kind")).toEqual("Class(Function)")
            // the value doesn't exist on new objects (i.e., those that haven't called .yep() yet)
            expect(() => evaluate("Object.new().kind")).toThrow()
            expect(evaluate("Object.defineMethod('nope', () => { self.kind = Class; self })")).toEqual("Function(Object.nope)")
            expect(evaluate("Object.new().nope().kind")).toEqual("Class(Class)")
            expect(evaluate("o.kind")).toEqual("Class(Function)")
        })

        it('initializes', () => {
            expect(evaluate("Baz = Class.new('Baz')")).toEqual("Class(Baz)")
            expect(evaluate("Baz.defineMethod('init', (value) => { self.value = value })")).toMatch("Function(Baz.init")
            expect(evaluate("baz = Baz.new(Object.new())")).toEqual("Baz")
            expect(evaluate("baz.value")).toEqual("Object")
            expect(evaluate("baz2 = Baz.new(Class.new('Quux'))")).toEqual("Baz")
            expect(evaluate("baz2.value")).toEqual("Class(Quux)")
        })
    })

    describe('class literal notation', () => {
        it('defines a class', () => {
            expect(evaluate("class Quux {}")).toEqual("Class(Quux)")
            expect(evaluate("Quux.new()")).toEqual("Quux")
            expect(evaluate("Quux.new().class")).toEqual("Class(Quux)")
        })

        it('defines an instance method', () => {
            expect(evaluate("class Foo { banana() { Function }}")).toEqual("Class(Foo)")
            expect(evaluate("Foo.new()")).toEqual("Foo")
            expect(evaluate("Foo.new().banana")).toEqual("Function(Foo.banana)")
            expect(evaluate("Foo.new().banana()")).toEqual("Class(Function)")
        })

        it("extends Object", () => {
            expect(evaluate("class Object { foo() { self.class } }")).toEqual("Class(Object)")
            expect(evaluate("Object.new().foo()")).toEqual("Class(Object)")
            expect(evaluate("Function.new(()=>{}).foo()")).toEqual("Class(Function)")
            expect(evaluate("Class.new().foo()")).toEqual("Class(Class)")
        })

        test.todo("subclasses specified class")
    })
});