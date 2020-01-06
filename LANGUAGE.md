# THE REFLEX PROGRAMMING LANGUAGE SPECIFICATION

## About

This document describes the structure of the Reflex programming language. 

## Guiding Principles

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
Every entity in the system also has a `Class`, which has a member `super` that is its parent class. The root of every object's ancestor chain is `Class(Object)`.
Classes have a `new` function which generates a new object, although note that the `new` method for Class itself can be used to create a new class.

### Metaclass
A special kind of class is a `Metaclass`, meaning an object that hold information about another class;
in particular, metaclasses carry details about the class method (instance methods 'of' classes). 
The metaclass is accessible on a class object through the member `meta`.
The metaclass of an object is likewise a singleton class that holds instance methods defined
exactly on that object, accessible via `meta` as well.

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
`nil` is the object of class Nihil.
It is the (implicit) return value of empty functions, and the piped value of an exhausted generator.
## Syntax
### self and super
A bare `self` is a references to the current context's object. 
`super` as a member on a class object is a reference to the superclass.
In instance methods, `super` refers to a facade that permits calling superclass methods 'as written' on the current object.

### Blocks/Yielding
A block is marked off by braces and can optionally have piped values passed to it.
Blocks may be given to functions, which can interact structurally with the block.
Functions can invoke their block and return by `yield`ing (recalling their 'place' if invoked again);
functions can also bind their block as a parameter with `&`
(e.g., `gen(&b) {b()}` is a function that calls its block with no args.)

# Concepts


## Key Ideas
We will be using the language to mainly explore these concepts.

### Message Dispatch
Most interactions with objects go through `send` on ReflexObject, which is going to check for instance 
methods on the object and then on parents/ancestors.
Symbols may be provided as block references (`arr.map(&:to_s)`) to permit tacit programming.

### First-class Functions
Any function you can invoke, you should be able to pass it around as an object in the system.
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
