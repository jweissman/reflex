# THE REFLEX PROGRAMMING LANGUAGE REFERENCE

## About

This document describes the structure of the Reflex programming language. 
(Note the "official spec" for now is just the reference implementation contained in this repository.)

## Coming from Ruby?

A lot of things will be familiar! In particular, the object-class-metaclass model will be familiar:

```
                          .super                               .super
            Meta(o) -------------------------> Meta(object) --------------> Metaclass
           ^                                    ^                             ^
          /                                    /                             /
         /  .meta                             /   .meta                     /
        /                                    /                             /
       /          .class                    /            .class           /
      o  -----------------------------> Object ----------------------> Class
      (instance)

```
(I suspect this repeating 'trapezoidal' structure is where the 'jewel-like' clarity and purity of reflecting languages comes from!)

On an object you have members like `self`, `super` and `meta`.
`self` is the object's own reference to itself.
`super` is the object 'seen as' its superclass (you can invoke superclass implementation of methods as super; chains)
`meta` is the object's metaclass ("eigenclass") 

Calling `meta.instanceEval { ... }` evaluates the block in the context of the metaclass.
You can use this construction to define class methods.
A helper for this idiom is defined in the preamble as `Class.auto`, used like:

```
class Foo {
  auto { bar() { 0 }}
}

Foo.bar() # => 0
```

In general, do/end is interchangeable with block structures. Ultimately, you can write very Ruby-ish code!
A few things to be aware of:

* You can omit parentheses in a lot of places, except for function calls without arguments. You must explicitly give
  parentheses to disambiguate this case from member access.
  (We want to permit simple object member access in many cases -- to be able to refer
  to an object's member functions as first class functions. So `Foo.bar` is always just going to return a 
  reference to the (possibly function-valued member) of `Class(Foo)`.)
* The standard library API, especially collections/enumerables, is heavily influenced by the languages that us inspire us; but keep in mind the implementation is black box -- and from memory -- and definitely not close to one-to-one. Even remotely precise equivalence or running actual Ruby code is not at all a design goal. Rather we want to build a rich reflective language with lots of suitable helpers to accelerate webdev (this is much closer to our target than mirroring Ruby's API in any sort of depth). This is not to say there isn't considerable inspiration taken of course!

## Learn by Doing
Some interactive Reflex sessions that might help communicate the feel, or be instructive to work through.

### Extend classes live
```
> 1.upto(10).collect(&:double)
Thrown:
MethodMissing: Method missing: double on Integer(1)
> class Integer { double() { self * 2 }}
->self*2
> 1.upto(10).collect(&:double)
[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
> 1.upto(10).collect(&:square)
Thrown:
MethodMissing: Method missing: square on Integer(1)
> class Integer { square() { self * self }}
->self*self
> 1.upto(10).collect(&:square)
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
> 1.upto(10).collect(&:square).select { |x| x.toString().isPalindrome() }
[1, 4, 9]
> 1.upto(100).collect(&:square).select { |x| x.toString().isPalindrome() }
[1, 4, 9, 121, 484, 676]
> 1.upto(1000).collect(&:square).select { |x| x.toString().isPalindrome() }
[1, 4, 9, 121, 484, 676, 10201, 12321, 14641, 40804, 44944, 69696, 94249, 698896]
> class Integer { cube() { self ^ 3 }}
->self^3
> 1.upto(10000).collect(&:cube).select { |x| x.toString().isPalindrome() }
...
```

### Explore the object model

```
> o=Object.new()
Object
> o.class
Object
> o.class.class
Class
> o.meta
Meta(Object instance)
> o.meta.super
Meta(Object)
> o.class.meta
Meta(Object)
> o.class.meta.super
Metaclass
> o.class.class
Class
> o.class.class.meta
Metaclass
```

## Execution Model

- Message dispatch is central. Messages are delivered to objects which respond to them.
  From the outside, in principle there's way to know how it may respond to the message.
  (without 'hard' reflection through the encapsulated objects' implementation.)
- An object receiving a message may have a member that responds to it, in which case that 
  function is executed. Otherwise, a MethodMissing exception is thrown.
- Objects can intercept these missing method exceptions by implementing an `onMethodMissing`
  member with a signature like `onMethodMissing(sym, ...args, &block)`. This method
  tells Reflex what to do with the message instead of throwing the exception.

## Core Types
### Object
Every entity in the system descends from `Object`.
Interacts via messages dispatched through its native `send` method.
Objects have members whose values are other objects and which are distinguished by their attribute names.
By default object member attributes are readonly. That is, objects accept raw attribute writes only when the context is self (e.g., when inside an instance method).
Instance methods are distinguished function-valued members of an object which are inherited.

Object instances can be created by calling the `new` method on an instance of `Class`.

```
o = Object.new()
o.inspect() // => "Object"
```

### Class
Every entity in the system also has a `Class`, which has a member `super` that is its parent class.
The root of every object's ancestor chain is `Class(Object)`.

Classes have a `new` function which generates a new object, although note that the `new` method for Class itself can be used to create a new class.

Since classes are themselves objects, they may respond to messages. Their instance methods are sometimes called "class methods" to distinguish them from the `instance_methods` member on class objects which specifies the shared implementations of methods on instances of a class.

### Metaclass
A special kind of class is a `Metaclass`, meaning an object that holds onto information about another class.
In general metaclasses carry the details about class methods (instance methods of the class).
The singleton metaclass of an object is likewise a class that holds instance methods defined on that object "exactly".

The metaclass is accessible on a class object through the member `meta`.
Eigenobjects are also accessible via `meta` on object instances.

### Function
A `Function` is a callable entity that can wrap a raw JS function or have a Reflex implementation.
Reflex functions can access locals both in their enclosing context and their context at definition.
Functions have a few different valid forms:
```
f=()=>{}    // define a local variable f
g=->{}      // define a local variable g
h(){}       // define an instance method h
```

### Nihil
`nil` is the object of class `Nihil`.
It is the (implicit) return value of empty functions, and the piped value of an exhausted generator.

### Boolean
`Boolean` is the class of truth-values.
There are two members, `true` and `false`.
Booleans respond to methods `true()`, `false()` and `negate()`.

### Number
`Number` is the class of numeric values. Numeric literals are instances of `Number` (usually a subclass `Integer` or `Float`).
There are some special numeric values like `Indeterminate` (our not-a-number representation), and (+/-) `Infinity`.

### String
`String`s are words, or textual values. Escaped unicode is permitted in double-quoted string literals.

### Array
`Array`s are object-valued index spaces.

### Range
`Range`s are bounded intervals. Range literals are of the form `0..100`.

### Iterator
`Iterator`s are internal iterators that directly implement a `next` method that gives successive elements of the iteratee. Has subclasses like `RangeIterator`, `ArrayIterator`, etc. The return value of a `times`, `upto`, etc.

### Enumerator
`Enumerator` is an external iterator (wraps around an iterator). The return value of an `each()`, `map()`, etc.

### Module
`Module`s are special classes that are intended to be used as mixins. Instance methods defined on a module can be copied into a class definition with `include` (e.g. `include Enumerable`.)

### Enumerable
Classes declaring they are `include Enumerable` are expected to implement an `each` method which gives an enumerator.

### Main
`Main` is the class of running Reflex programs. Main is wired to define instance methods on itself, so that an instance method definition outside
of any class definition defines the method on main.

### 

## Syntax
### self and super
A bare `self` is a references to the current context's object. 
`super` as a member on a class object is a reference to the superclass.
In instance methods, `super` refers to a facade that permits calling superclass methods 'as written' on the current object.

### Blocks
A block is marked off by braces and can optionally have piped values passed to it.
Blocks may be provided to functions, which can interact structurally with the block.
Functions can bind a provided block as an explicit parameter with `&` (e.g., `gen(&b) {b()}` is a function that calls its block with no args.)

# Concepts


## Key Ideas
We will be using the language to mainly explore these concepts.

### Message Dispatch
Most interactions with objects go through `send` on ReflexObject, which is going to check for instance 
methods on the object and then on parents/ancestors.
Symbols may be provided as block references (`arr.map(&:to_s)`) to permit tacit programming.

### First-class Functions
Any function you can invoke, you should be able to pass around as an object in the system.
Functions can be turned into blocks, and methods receiving blocks can treat those blocks like functions
(as well as `yield`ing to them.)
Functions are created as the interpreter encounters them; their AST representation is in the bytecode the VM executes.

### Binding
There is a globally-accessible binding object wrapping around the current execution context of the interpreter.
It should be able to get/set local vars, send messages etc.

### Mirrors and Holograms
Reflective utilities are accessible through an explicit `Mirror` utility object,
which should conjure classes, dispatch methods and capture bindings.
Mirrors can also create different kinds of reflected objects ("illusions", "holograms") that can 
intercept, introspect on and modify messages, as well as manipulate bindings.
(Encourage a strict separation between reflecting instruments and 'object code'.)

### Traits
Classes may specify mixin behaviors, modelled as formal trait objects that can be reflected on
(e.g., `Array.enumerable?` should be true.) Support for parameterized traits (like accessors).

### Archetypes
User-defined data structures and iteration primitives.
A DSL construction kit that permits tacit programming, without heavy userland reflection.

### String Tooling
A good set of string tools seems important for reflecting effectively. The standard library should
support a lot of important string transformations natively. (I'm not sure this means we need to own
a pluralization dictionary but it does seem useful...)

### Structural Literals (Trees, Graphs)
Support a tree literal notation which can capture most of the XHTML structure a webserver/webapp needs to be concerned with.
(I keep thinking this could be a literal AST structure too, permitting some meta-circular logic, but that feels
decidedly for further on.)
A graph literal notation (basically a hash literal with a different brace which allows for key repetition) could be interesting too. 

# On Reflection

Reflection is a powerful property, relating inherently to both symmetry and language or "representation".

Reflex tries to explore some of the questions about the expressive power of reflexivity that have been posed
for instance by languages like Ruby, Eiffel, Smalltalk, Self and Simula. ("Zuse" could be a name for this language!)

A central aim is providing structured, fine-grained mechanisms for reflection.

In particular the reflecting instruments as we conceive them:
  - 'mirrors' for creating images (lightweight proxies/decorators/views) and illusions (structured pseudo-objects like super);
  - 'wands' for mapping between the JS environment and back (wands "cast" between reflex and JS); some of the 'permanent' structures wands can create 'portals' and 'wormholes' for transporting things across the language barrier...
  - 'crystals' for creating, in conjunction with mirrored objects, 'holograms' or structured systems of images/proxies;

Some of the more mechanical elements...
  - 'archetypes', a reflective approach to structural types, for creating new kinds in the system (i.e., something like a type but modelled objectively -- classes themselves could be an archetype)
  - 'aspects' or traits, mixins -- only different from mixing in anonymous module in that they can be reflected on directly
  

# Guiding Principles

Programming is a human activity, a social one, even if often performed in "isolation". 
Language design choices seem abstract yet they are profoundly aesthetic and cultural,
but beyond even this they have ethical and social meanings.
With that in mind, here are the principles that will guide us.

0. *Humanity matters.*
   Prefer not just DX, prioritize not only readability (although a serious concern with linguistics is part of
   this, i.e., part of the human-centric focus), but favor also deep consistency with human values.
   Design systems that foster kind and connected relationships between people.
   Design human-centered systems.

1. *Joy matters.*
   Systems and processes organizing themselves around people and interactions is preferrable to the opposite.
   Computers promise human beings an enormous liberation from drudgery.
   So:
   Liberate people.

2. *Eloquence is brevity.*
   You can travel further if you are carrying less.
   Don't seek a terminal minimalism of pure concatenative expressions or convoluted algebrae.
   Find expressive pathways through reflection and reification.
   Embrace the power of point-free programming while retaining the harness of an object model.

3. *Communicate dynamically.*
   Message passing is a universal model of communicating dynamic processes, so: 
   communicate dynamically.
   Get better at writing less.
   Think about cells.

4. *Guardrails for metaprogramming.*
   Embrace metalanguage where necessary to empower users, but keep reflective tools well isolated from object code.

5. *Create languages.*
   Capture ideas as languages.
   Focus on the expression of problems rather than solution-specification.
   A good object system is a self-reflecting servomechanism: a small problem statement generates a complete and complex solution.

