import Reflex from "./Reflex"

// const expectReflexEquals = (input: string, expected: string) =>
    // expect(evaluate(input)).toEqual(expected)


describe(Reflex, () => {
    let reflex: Reflex = new Reflex()
    const evaluate = (input: string) => reflex.evaluate(input).toString()
    describe('Object', () => {
        it('is a class', () => {
            expect(evaluate("Object.class")).toEqual("Class(Class)")
        });
        it('is the class of Objects', () => {
            expect(evaluate("Object")).toEqual("Class(Object)")
        });
        it('is its own supertype', () => {
            expect(evaluate("Object.super")).toEqual("Class(Object)")
        })
        describe(".new", () => {
            it('is a Function', () => {
                expect(evaluate("Object.new")).toEqual("Function(Object.new[wrap])")
            })
            it('constructs new Object', () => {
                expect(evaluate("Object.new()")).toEqual("Object")
            })
            it('constructed Objects have Object as class', () => {
                expect(evaluate("Object.new().class")).toEqual("Class(Object)")
            })
            it('constructed objects have a class that is a class', () => {
                expect(evaluate("Object.new().class.class")).toEqual("Class(Class)")
            })
            // it('wraps the argument if given one', () => {
            //     expect(evaluate("Object.new(Object)")).toEqual("Object")
            //     expect(evaluate("Object.new(()=>{Class})")).toEqual("Function")
            //     expect(evaluate("Object.new(Class.new('Bar'))")).toEqual("Class(Bar)")
            // })
        });
        describe('#methods()', () => {
            test.todo("once we have lists and strings/symbols...")
            // xit('reports instance member variables that are callable', () => {
                // expect(evaluate("Object.new().methods()")).toMatch(/\[.+\]/)
            // })
        })

        // describe("everything is an instance of Object", () => {
        //     // expect(evaluate("Object.new().isA(Object)")).toEqual(true)
        // })
    });

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
                expect(reflex.machine.stack.length).toEqual(0)
                // the value doesn't exist on new objects (i.e., those that haven't called .yep() yet)
                expect(() => evaluate("Object.new().kind")).toThrow()
                expect(evaluate("Object.defineMethod('nope', () => { self.kind = Class; self })")).toEqual("Function(Object.nope)")
                expect(reflex.machine.stack.length).toEqual(0)
                expect(evaluate("Object.new().nope().kind")).toEqual("Class(Class)")
                expect(reflex.machine.stack.length).toEqual(0)
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
        })
    });

    describe('Function', () => {
        it('is the class of Functions', () => {
            expect(evaluate("Function")).toEqual("Class(Function)")
        })
        it('is a class', () => {
            expect(evaluate("Function.class")).toEqual("Class(Class)")
        })
        it('has object as supertype', () => {
            expect(evaluate("Function.super")).toEqual("Class(Object)")
        })
        it('creates functions', () => {
            expect(evaluate("foo() { Object }")).toEqual("Function(foo)")
        });
        it('invokes functions', () => {
            expect(evaluate("foo() { Object }")).toEqual("Function(foo)")
            expect(evaluate("foo()")).toEqual("Class(Object)")
        })
        it('creates lambdas', () => {
            expect(evaluate("()=>{Object}")).toMatch(/Function\(lambda-\d+\)/)
        });
        it('invokes lambdas', () => {
            expect(evaluate("f=()=>{Object}")).toMatch(/Function\(lambda-\d+\)/)
            expect(evaluate("f()")).toEqual("Class(Object)")
        });
        describe('.new', () => {
            it('returns its arg', () => {
                expect(evaluate("fn=Function.new(()=>{Class})")).toMatch("Function")
                expect(evaluate("fn.class")).toMatch("Class(Function)")
                expect(evaluate("fn()")).toMatch("Class(Class)")
            })
        })
        xit('binds self', () => {
            expect(evaluate("class Baz{bar(){b=self;()=>{b}}}")).toEqual("Class(Baz)")
            expect(evaluate("baz=Baz.new()")).toEqual("Baz")
            expect(evaluate("fn=baz.bar()")).toMatch("Function")
            expect(evaluate("fn()")).toMatch("Baz")
        })
    })

    describe("Boolean", () => {
        xit('is the class of truth-values', () => {
            expect(evaluate("Boolean")).toEqual("Class(Boolean)")
        })
    })

    describe("String", () => {
        xit('is the class of words', () => {
            expect(evaluate("String")).toEqual("Class(String)")
        })
    })

    describe("Number", () => {
        xit('is the class of numeric values', () => {
            expect(evaluate("Number")).toEqual("Class(Number)")
        })
    })

    describe("Array", () => {
        xit('is the class of collections', () => {
            expect(evaluate("Array")).toEqual("Class(Array)")
        })
    })

    describe("Nil", () => {
        xit('is the class of uninhabited types', () => {
            expect(evaluate("Nil")).toEqual("Class(Nil)")
        });

        xit('is a class', () => {
            expect(evaluate("Nil.class")).toEqual("Class(Class)")
        })

        xit('has object as supertype', () => {
            expect(evaluate("Nil.super")).toEqual("Class(Object)")
        })
            // expect(evaluate("nil")).toEqual("Nil")
            // expect(evaluate("nil.class")).toEqual("Class(Nil)")
        // })
    })


    describe('main', () => {
        it('is an object', () => {
            expect(evaluate("self")).toEqual("Main")
        })
        it('has a class', () => {
            expect(evaluate("Main")).toEqual("Class(Main)")
        })
        it('has a class that is a class', () => {
            expect(evaluate("Main.class")).toEqual("Class(Class)")
        })
        it('descends from object', () => {
            expect(evaluate("Main.super")).toEqual("Class(Object)")
        })

        it('local variables', () => {
            evaluate("Obj = Object")
            expect(evaluate("Obj")).toEqual("Class(Object)")
            expect(evaluate("Obj.class")).toEqual("Class(Class)")
            evaluate("o = Object.new()")
            expect(evaluate("o")).toEqual("Object")
            expect(evaluate("o.class")).toEqual("Class(Object)")
            // they are not defined on main but 'merely' in local scope / frame 
            // (so inherited into child scopes but not living on the object as such...)
            expect(()=>evaluate("self.o")).toThrow()
        })

        //it('local variables', () => {
        //    evaluate("self.Obj = Object")
        //    expect(evaluate("Obj")).toEqual("Class(Object)")
        //    expect(evaluate("Obj.class")).toEqual("Class(Class)")
        //    evaluate("o = Object.new()")
        //    expect(evaluate("o")).toEqual("Object")
        //    expect(evaluate("o.class")).toEqual("Class(Object)")
        //})
        
        //test.todo('construct new instance of new class')
        //test.todo('define new class more eloquently')
        //test.todo('construct new instance of new class')
        //test.todo('invoke parent methods')
        //test.todo('construct new function')
        //test.todo('construct new higher-order function')
    })
})