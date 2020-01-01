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
        it('is a function', () => {
            evaluate("f=Class.new")
            expect(evaluate("f()")).toEqual("Class(Anonymous)")
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
            // expect(
                evaluate("Object.defineMethod('baz', () => { Function })")
                // ).toEqual("Function(Object#baz)")
            expect(evaluate("o.baz")).toEqual("Function(Object#baz)")
            expect(evaluate("o.baz()")).toEqual("Class(Function)")
            expect(evaluate("o2=Object.new()")).toEqual("Object")
            expect(evaluate("o2.baz")).toEqual("Function(Object#baz)")
            expect(evaluate("o2.baz()")).toEqual("Class(Function)")
        })

        it('redefines an instance method', () => {
            expect(evaluate("o=Object.new()")).toEqual("Object")
            // expect(
                evaluate("Object.defineMethod('baz', () => { Function })")
                // ).toEqual("Function(Object#baz)")
            // expect(
                evaluate("Object.defineMethod('baz', () => { Class })")
            // ).toEqual("Function(Object#baz)")
            expect(evaluate("o.baz")).toEqual("Function(Object#baz)")
            expect(evaluate("o.baz()")).toEqual("Class(Class)")
            expect(evaluate("o2=Object.new()")).toEqual("Object")
            expect(evaluate("o2.baz")).toEqual("Function(Object#baz)")
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
            // expect(
                evaluate("Object.defineMethod('quux', () => { Function })")
            // ).toEqual("Function(Object#quux)")
            expect(evaluate('o.quux')).toEqual('Function(Object#quux)')
            expect(evaluate('o.quux()')).toEqual('Class(Function)')

            expect(evaluate("Bar=Class.new('Bar')")).toEqual("Class(Bar)")
            expect(evaluate("Bar.super")).toEqual("Class(Object)")
            expect(evaluate('bar=Bar.new()')).toEqual('Bar')
            expect(evaluate('bar.quux')).toEqual('Function(Object#quux)')
            expect(evaluate('bar.quux()')).toEqual('Class(Function)')

            expect(evaluate("Baz=Class.new('Baz', Bar)")).toEqual("Class(Baz)")
            expect(evaluate("Baz.super")).toEqual("Class(Bar)")
            expect(evaluate('baz=Baz.new()')).toEqual('Baz')
            expect(evaluate('baz.quux')).toEqual('Function(Object#quux)')
            expect(evaluate('baz.quux()')).toEqual('Class(Function)')
        })

        it('may set a value', () => {
            evaluate("Object.defineMethod('yep', () => { self.kind = Function })")
                // .toEqual("Function(Object#yep)")
            evaluate("o=Object.new()")
            expect(evaluate("o.yep")).toEqual("Function(Object#yep)")
            evaluate("o.yep()")
            expect(evaluate("o.kind")).toEqual("Class(Function)")
            // the value doesn't exist on new objects (i.e., those that haven't called .yep() yet)
            expect(() => evaluate("Object.new().kind")).toThrow()
            // expect(
                evaluate("Object.defineMethod('nope', () => { self.kind = Class; self })")
            // ).toEqual("Function(Object#nope)")
            expect(evaluate("Object.new().nope().kind")).toEqual("Class(Class)")
            expect(evaluate("o.kind")).toEqual("Class(Function)")
        })

        it('initializes', () => {
            expect(evaluate("Baz = Class.new('Baz')")).toEqual("Class(Baz)")
            evaluate("Baz.defineMethod('init', (value) => { self.value = value })") //).toEqual("Function(Baz#init)")
            expect(evaluate("baz = Baz.new(Object.new())")).toEqual("Baz")
            expect(evaluate("baz.value")).toEqual("Object")
            expect(evaluate("baz2 = Baz.new(Class.new('Quux'))")).toEqual("Baz")
            expect(evaluate("baz2.value")).toEqual("Class(Quux)")
        })
    })

    describe('class literal notation', () => {
        it('defines a class', () => {
            expect(evaluate("class Quux {}; Quux")).toEqual("Class(Quux)")
            expect(evaluate("Quux.new()")).toEqual("Quux")
            expect(evaluate("Quux.new().class")).toEqual("Class(Quux)")
        })

        it('defines an instance method', () => {
            expect(evaluate("class Foo { banana() { Function }}; Foo")).toEqual("Class(Foo)")
            expect(evaluate("Foo.new()")).toEqual("Foo")
            expect(evaluate("Foo.new().banana")).toEqual("Function(Foo#banana)")
            expect(evaluate("Foo.new().banana()")).toEqual("Class(Function)")
        })

        it("extends Object", () => {
            expect(evaluate("class Object { foo() { self.class } }; Object")).toEqual("Class(Object)")
            expect(evaluate("Object.new().foo()")).toEqual("Class(Object)")
            expect(evaluate("Function.new(()=>{}).foo()")).toEqual("Class(Function)")
            expect(evaluate("Class.new().foo()")).toEqual("Class(Class)")
        })

        it("subclasses specified class", () => {
            evaluate("class Fizz {}; class Buzz < Fizz {}; class Bang < Buzz {}")
            expect(evaluate("Bang.super")).toEqual("Class(Buzz)")
            expect(evaluate("Buzz.super")).toEqual("Class(Fizz)")
            expect(evaluate("Fizz.super")).toEqual("Class(Object)")
        })

        it('calls methods in class definition', () => {
            evaluate("class Animal { self.defineMethod('speak', () => Object) }");
            expect(evaluate("Animal.new().speak()")).toEqual('Class(Object)')
        })

        xit('defines methods with blocks', () => {
            evaluate("class Animal { self.defineMethod('speak') { Function } }");
            expect(evaluate("Animal.new().speak()")).toEqual('Class(Function)')
        })

        it('defines class methods', () => {
            evaluate("class Animal { self.defineClassMethod('foo', () => { Object })}")
            expect(evaluate("Animal.foo()")).toEqual("Class(Object)")
        });

        xit('defines class methods with blocks', () => {
            evaluate("class Animal { self.defineClassMethod('baz') { Nihil } }");
            expect(evaluate("Animal.new().baz()")).toEqual('Class(Nihil)')
        })

        xit('defines class methods with shorthand', () => {
            evaluate("class Animal { .foo() { Object }; .bar() { Class }}")
            // jeez, could have a method_missing on class that just defines it from a block?
            // (that's just chaos though, even if we were checking for a block)
            expect(evaluate("Animal.foo()")).toEqual("Class(Object)")
            expect(evaluate("Animal.bar()")).toEqual("Class(Class)")
        });
        
        it('inherits class methods', () => {
            evaluate("class Animal { self.defineClassMethod('foo', () => { Object })}")
            evaluate("class Bird < Animal { self.defineClassMethod('bar', () => { Class })}")
            expect(evaluate("Bird")).toEqual("Class(Bird)")
            expect(evaluate("Bird.foo()")).toEqual("Class(Object)")
            expect(evaluate("Bird.bar()")).toEqual("Class(Class)")
        });
    })
    
    describe('super', () => {
        it('is the classes superclass', () => {
            evaluate("class Animal {}; class Bird < Animal {}; class Flamingo < Bird {}")
            expect(evaluate("Animal.super")).toEqual("Class(Object)")
            expect(evaluate("Bird.super")).toEqual("Class(Animal)")
            expect(evaluate("Flamingo.super")).toEqual("Class(Bird)")
            expect(evaluate("Flamingo.super.super")).toEqual("Class(Animal)")
            expect(evaluate("Flamingo.super.super.super")).toEqual("Class(Object)")
            expect(evaluate("Flamingo.super.super.super.super")).toEqual("Class(Object)")
        })

        it('object class is its own superclass', () => {
            expect(evaluate("Object.super")).toEqual("Class(Object)")
            expect(evaluate("Object.super.super")).toEqual("Class(Object)")
            expect(evaluate("Object.super.super.super")).toEqual("Class(Object)")
        })
    })

    describe('meta', () => {
        it('is the classes metaclass', () => {
            evaluate("class Animal {}; class Bird < Animal {};")
            expect(evaluate("Animal.meta")).toEqual("Class(Meta(Animal))")
            expect(evaluate("Bird.meta")).toEqual("Class(Meta(Bird))")
            expect(evaluate("Bird.meta.super")).toEqual("Class(Meta(Animal))")
        });

        xit('creates metaclasses on demand', () => {
            evaluate("class Baron {}")
            expect(evaluate("Baron.meta.meta")).toEqual("Class(Meta(Meta(Baron)))")
        })

        it('object metaclass is its own metaclass', () => {
            expect(evaluate("Class.meta")).toEqual("Class(Meta(Class))")
            expect(evaluate("Class.meta.super")).toEqual("Class(Meta(Object))")
            expect(evaluate("Class.meta.super.super")).toEqual("Class(Meta(Object))")

            expect(evaluate("Object.meta")).toEqual("Class(Meta(Object))")
            expect(evaluate("Object.meta.super")).toEqual("Class(Meta(Object))")
            expect(evaluate("Object.meta.super.meta")).toEqual("Class(Meta(Object))")
        })
    })
});