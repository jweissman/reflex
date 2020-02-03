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
            expect(evaluate("Class.new")).toEqual("Class(Class).new")
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
            evaluate("Object.defineMethod('baz', () => { Function })")
            expect(evaluate("o.baz")).toEqual("Object#baz")
            expect(evaluate("o.baz()")).toEqual("Class(Function)")
            expect(evaluate("o2=Object.new()")).toEqual("Object")
            expect(evaluate("o2.baz")).toEqual("Object#baz")
            expect(evaluate("o2.baz()")).toEqual("Class(Function)")
        })

        it('redefines an instance method', () => {
            expect(evaluate("o=Object.new()")).toEqual("Object")
            evaluate("Object.defineMethod('baz', () => { Function })")
            evaluate("Object.defineMethod('baz', () => { Class })")
            expect(evaluate("o.baz")).toEqual("Object#baz")
            expect(evaluate("o.baz()")).toEqual("Class(Class)")
            expect(evaluate("o2=Object.new()")).toEqual("Object")
            expect(evaluate("o2.baz")).toEqual("Object#baz")
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
            evaluate("Object.defineMethod('quux', () => { Function })")
            expect(evaluate('o.quux')).toEqual('Object#quux')
            expect(evaluate('o.quux()')).toEqual('Class(Function)')

            expect(evaluate("Bar=Class.new('Bar')")).toEqual("Class(Bar)")
            expect(evaluate("Bar.super")).toEqual("Class(Object)")
            expect(evaluate('bar=Bar.new()')).toEqual('Bar')
            expect(evaluate('bar.quux')).toEqual('Object#quux')
            expect(evaluate('bar.quux()')).toEqual('Class(Function)')

            expect(evaluate("Baz=Class.new('Baz', Bar)")).toEqual("Class(Baz)")
            expect(evaluate("Baz.super")).toEqual("Class(Bar)")
            expect(evaluate('baz=Baz.new()')).toEqual('Baz')
            expect(evaluate('baz.quux')).toEqual('Object#quux')
            expect(evaluate('baz.quux()')).toEqual('Class(Function)')
        })

        it('may set a value', () => {
            evaluate("Object.defineMethod('yep', () => { self.kind = Function })")
            evaluate("o=Object.new()")
            expect(evaluate("o.yep")).toEqual("Object#yep")
            evaluate("o.yep()")
            expect(evaluate("o.kind")).toEqual("Class(Function)")
            expect(() => evaluate("Object.new().kind")).toThrow() // todo maybe don't break the machine?
            evaluate("Object.defineMethod('nope', () => { self.kind = Class; self })")
            expect(evaluate("Object.new().nope().kind")).toEqual("Class(Class)")
            expect(evaluate("o.kind")).toEqual("Class(Function)")
        })

        it('initializes', () => {
            expect(evaluate("Baz = Class.new('Baz')")).toEqual("Class(Baz)")
            evaluate("Baz.defineMethod('init', (value) => { self.value = value })")
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
            expect(evaluate("Foo.new().banana")).toEqual("Foo#banana")
            expect(evaluate("Foo.new().banana()")).toEqual("Class(Function)")
        })

        it("extends Object", () => {
            expect(evaluate("class Object { foo() { self.class } }; Object")).toEqual("Class(Object)")
            expect(evaluate("Object.new().foo()")).toEqual("Class(Object)")
            expect(evaluate("(()=>{}).foo()")).toEqual("Class(Function)")
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

        it('defines methods with blocks', () => {
            evaluate("class Animal { self.defineMethod('speak') { Function } }");
            expect(evaluate("Animal.new().speak()")).toEqual('Class(Function)')
        })

        it('defines class methods', () => {
            evaluate("class Animal { self.defineClassMethod('foo', () => { Object })}")
            expect(evaluate("Animal.foo()")).toEqual("Class(Object)")
        });

        it('defines class methods with blocks', () => {
            evaluate("class Animal { self.defineClassMethod('baz') { Nihil } }");
            expect(evaluate("Animal.baz")).toEqual('Animal.baz')
            expect(evaluate("Animal.baz()")).toEqual('Class(Nihil)')
        })

        it('defines class methods with meta', () => {
            evaluate("class Zanzibar { meta.defineMethod('quux') { Class } }");
            expect(evaluate("Zanzibar.quux")).toEqual('Zanzibar.quux')
            expect(evaluate("Zanzibar.quux()")).toEqual('Class(Class)')
        })

        it('does not confuse instance methods and class methods', () => {
            evaluate("class Aquarium { meta.defineMethod('create') { self.new() }}")
            expect(evaluate("Aquarium.create()")).toEqual("Aquarium")
            expect(()=>evaluate("Aquarium.new().create()")).toThrow()
            evaluate("Aquarium.defineMethod('update') { Object }")
            expect(evaluate("Aquarium.new().update()")).toEqual("Class(Object)")
            expect(()=>evaluate("Aquarium.update()")).toThrow()
        })

        it('meta only extends class (not super)', () => {
            evaluate("class Zanzibar { meta.defineMethod('pristine') { Class } }");
            expect(evaluate("Zanzibar.pristine")).toEqual('Zanzibar.pristine')
            expect(evaluate("Zanzibar.pristine()")).toEqual('Class(Class)')
            expect(()=>evaluate("Object.pristine()")).toThrow()
        })

        it('defines class methods with meta.instanceEval blocks', () => {
            evaluate(`class Shape {
                meta.instanceEval {
                    barge() { Class };
                    foo() { Object }
                }
            }`)
            expect(evaluate("Shape.foo")).toEqual("Shape.foo")
            expect(evaluate("Shape.foo()")).toEqual("Class(Object)")
            expect(evaluate("Shape.barge")).toEqual("Shape.barge")
            expect(evaluate("Shape.barge()")).toEqual("Class(Class)")
            expect(()=>evaluate("Object.barge()")).toThrow()

            evaluate(`class Circle < Shape {
                meta.instanceEval {
                    quark() { Function }
                }
            }`)
            expect(evaluate("Circle.foo")).toEqual("Shape.foo")
            expect(evaluate("Circle.foo()")).toEqual("Class(Object)")
            expect(evaluate("Circle.barge()")).toEqual("Class(Class)")
            expect(evaluate("Circle.quark")).toEqual("Circle.quark")
            expect(evaluate("Circle.quark()")).toEqual("Class(Function)")
            expect(()=>evaluate("Shape.quark()")).toThrow()
        });

        it('defines class methods within the namespace', () => {
            evaluate(`class A{
                meta.instanceEval {
                    quartz(){Class}
                }
            }`)
            expect(evaluate("A.quartz()")).toEqual("Class(Class)")
            expect(()=>evaluate("Object.quartz()")).toThrow()
        })
        
        it('inherits class methods', () => {
            evaluate("class Animal { self.defineClassMethod('foo', () => { Object })}")
            evaluate("class Bird < Animal { self.defineClassMethod('bar', () => { Class })}")
            expect(evaluate("Bird")).toEqual("Class(Bird)")
            expect(evaluate("Bird.foo()")).toEqual("Class(Object)")
            expect(evaluate("Bird.bar()")).toEqual("Class(Class)")
        });

        it('defines multiple functions in a class stmt', () => {
            evaluate("class Bar{a(){b()};b(){c()};c(){Class}}");
            evaluate("bar=Bar.new()");
            expect(evaluate("bar.a()")).toEqual("Class(Class)")
        })
    })
    
    describe('super', () => {
        it('is the superclass', () => {
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


        describe('metaclasses unfold', () => {
            it("object has infinite meta chain", () => {
                expect(evaluate("Object.meta")).toEqual("Class(Meta(Object))")
                expect(evaluate("Object.meta.meta")).toEqual("Class(Meta(Meta(Object)))")
                expect(evaluate("Object.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Object))))")
                expect(evaluate("Object.meta.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Meta(Object)))))")
            })

            it("class has infinite meta chain", () => {
                expect(evaluate("Class.meta")).toEqual("Class(Metaclass)")
                expect(evaluate("Class.meta.meta")).toEqual("Class(Meta(Metaclass))")
                expect(evaluate("Class.meta.meta.meta")).toEqual("Class(Meta(Meta(Metaclass)))")
                expect(evaluate("Class.meta.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Metaclass))))")
            })

            it("metaclass has infinite meta chain", () => {
                expect(evaluate("Metaclass.meta")).toEqual("Class(Meta(Metaclass))")
                expect(evaluate("Metaclass.meta.meta")).toEqual("Class(Meta(Meta(Metaclass)))")
                expect(evaluate("Metaclass.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Metaclass))))")
                expect(evaluate("Metaclass.meta.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Meta(Metaclass)))))")
            })

            it('arbitrary classes have infinite meta chain', () => {
                evaluate("class Baron {}")
                expect(evaluate("Baron.meta")).toEqual("Class(Meta(Baron))")
                expect(evaluate("Baron.meta.meta")).toEqual("Class(Meta(Meta(Baron)))")
                expect(evaluate("Baron.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Baron))))")
                expect(evaluate("Baron.meta.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Meta(Baron)))))")
            })
            
            it('instances have infinite meta chain', () => {
                evaluate("o = Object.new()")
                expect(evaluate("o.meta")).toEqual("Class(Meta(Object instance))")
                expect(evaluate("o.meta.meta")).toEqual("Class(Meta(Meta(Object instance)))")
                expect(evaluate("o.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Object instance))))")
                expect(evaluate("o.meta.meta.meta.meta")).toEqual("Class(Meta(Meta(Meta(Meta(Object instance)))))")
            })
        })

        xit('metaclass is ancestor of all metaclasses', () => {
            expect(evaluate("Class.meta")).toEqual("Class(Metaclass)")
            expect(evaluate("Class.meta.super")).toEqual("Class(Class)")
            expect(evaluate("Class.meta.super.super")).toEqual("Class(Object)")
            // expect(evaluate("Class.meta.super.super.super")).toEqual("Class(Object)")

            expect(evaluate("Function.meta")).toEqual("Class(Meta(Function))")
            expect(evaluate("Function.meta.super")).toEqual("Class(Meta(Object))")
            expect(evaluate("Function.meta.super.super")).toEqual("Class(Meta(Class))")
            expect(evaluate("Function.meta.super.super.super")).toEqual("Class(Metaclass)")
            expect(evaluate("Function.meta.super.super.super.super")).toEqual("Class(Class)")

            expect(evaluate("Nihil.meta")).toEqual("Class(Meta(Nihil))")
            expect(evaluate("Nihil.meta.super")).toEqual("Class(Meta(Object))")
            expect(evaluate("Nihil.meta.super.super")).toEqual("Class(Meta(Class))")

            expect(evaluate("Object.new().meta")).toEqual("Class(Meta(Object instance))")
            expect(evaluate("Object.new().meta.super")).toEqual("Class(Meta(Object))")
            expect(evaluate("Object.new().meta.super.super")).toEqual("Class(Meta(Class))")

            expect(evaluate("Object.meta")).toEqual("Class(Meta(Object))")
            expect(evaluate("Object.meta.super")).toEqual("Class(Meta(Class))")
            expect(evaluate("Object.meta.super.super")).toEqual("Class(Metaclass)")
       })

        it('Metaclass is in global namespace', () => {
            expect(evaluate("Metaclass")).toEqual("Class(Metaclass)")
            expect(evaluate("Metaclass.meta")).toEqual("Class(Meta(Metaclass))")
            expect(evaluate("Metaclass.pre")).toEqual("Class(Class)")
        })

        it('metaclasses have a .pre entry back to the protoclass', () => {
            expect(evaluate("Function.meta.pre")).toEqual("Class(Function)")
            expect(evaluate("Object.meta.pre")).toEqual("Class(Object)")
            expect(evaluate("class Bar{};Bar.meta.pre")).toEqual("Class(Bar)")
        })

        it('instances have eigenclass (eigenobject)', () => {
            evaluate("o=Object.new()")
            expect(evaluate("o.meta")).toEqual("Class(Meta(Object instance))")
        })

        it('class methods on Metaclass are methods on all metaclasses', () => {
            evaluate("Metaclass.defineClassMethod('opalescence') {self}")
            expect(evaluate("Function.meta.opalescence()")).toEqual("Class(Meta(Function))")
            expect(evaluate("Nihil.meta.opalescence()")).toEqual("Class(Meta(Nihil))")
            expect(evaluate("Class.meta.opalescence()")).toEqual("Class(Metaclass)")
            expect(evaluate("Object.meta.opalescence()")).toEqual("Class(Meta(Object))")

            evaluate("Class.meta.defineClassMethod('quintessence') {self}")
            expect(evaluate("Class.meta.quintessence()")).toEqual("Class(Metaclass)")
            expect(evaluate("Object.meta.quintessence()")).toEqual("Class(Meta(Object))")
            expect(evaluate("Function.meta.quintessence()")).toEqual("Class(Meta(Function))")
            expect(evaluate("Nihil.meta.quintessence()")).toEqual("Class(Meta(Nihil))")

            evaluate("Object.meta.defineClassMethod('epitome') {self}")
            expect(evaluate("Object.meta.epitome()")).toEqual("Class(Meta(Object))")
            expect(evaluate("Function.meta.epitome()")).toEqual("Class(Meta(Function))")
            expect(evaluate("Nihil.meta.epitome()")).toEqual("Class(Meta(Nihil))")
            expect(()=>evaluate("Class.meta.epitome()")).toThrow()

            evaluate("Function.meta.defineClassMethod('ideal') {self}")
            expect(evaluate("Function.meta.ideal()")).toEqual("Class(Meta(Function))")
            expect(()=>evaluate("Nihil.meta.ideal()")).toThrow()
            expect(()=>evaluate("Object.meta.ideal()")).toThrow()
            expect(()=>evaluate("Class.meta.ideal()")).toThrow()
        })

        it('instance methods on Metaclass are methods on all metaclasses', () => {
            evaluate("Metaclass.defineMethod('levity') {Function}")
            expect(evaluate("Function.meta.levity()")).toEqual("Class(Function)")
            expect(evaluate("Nihil.meta.levity()")).toEqual("Class(Function)")
            expect(evaluate("Class.meta.levity()")).toEqual("Class(Function)")
            expect(evaluate("Object.meta.levity()")).toEqual("Class(Function)")
        })
    })

    describe(".instanceEval", () => {
        it('evaluates the block as the class', () => {
            expect(evaluate("Class.instanceEval { self }")).toEqual("Class(Class)")
            expect(evaluate("Object.instanceEval { self }")).toEqual("Class(Object)")
            expect(evaluate("Function.instanceEval { self }")).toEqual("Class(Function)")
        })

        it('evaluates the block as the meta class', () => {
            expect(evaluate("Class.meta.instanceEval { self }")).toEqual("Class(Metaclass)")
            expect(evaluate("Object.meta.instanceEval { self }")).toEqual("Class(Meta(Object))")
            expect(evaluate("Function.meta.instanceEval { self }")).toEqual("Class(Meta(Function))")
        })
        
        it('defines wrappers around instanceEval', () => {
            evaluate("class Class { auto(&b) { meta.instanceEval(b) }} ")
            evaluate("class Roll { auto { barrel() { Class }}}")
            expect(evaluate("Roll.barrel()")).toEqual("Class(Class)")
            expect(()=>evaluate("Class.barrel()")).toThrow()
            // maybe it needs an antonym
            evaluate("class Metaclass { allo(&b) { pre.instanceEval(b) }}")
            expect(evaluate("Roll.meta.allo { self }")).toEqual("Class(Roll)")
        })
    })

    describe(".isAncestorOf/isDescendantOf", () => {
        it('describes superclass relationships', () => {
            expect(evaluate("Class.isAncestorOf(Object)")).toEqual(false) //false)
            expect(evaluate("Object.isAncestorOf(Class)")).toEqual(true)
            expect(evaluate("Class.isDescendantOf(Object)")).toEqual(true)
            expect(evaluate("Object.isDescendantOf(Class)")).toEqual(false)
        })
    })
});