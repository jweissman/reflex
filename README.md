# reflex

🤖 GENERAL-PURPOSE programming language

💎 Write code with CRYSTALLINE ELEGANCE 

🕵🏻‍ Employ reification and REFLECTION

🎉 Syntax for XML LITERALS

🥂 Interoperate with JAVASCRIPT 

🥳 Enjoy SAFE METAPROGRAMMING

# Synopsis

A general-purpose, reflection-oriented language for the contemporary web.

# About

A reflecting language, inspired by Ruby, Eiffel, Self, Smalltalk.
This repo contains the grammar, the vm and the cli harness.
Implemented in Typescript.


# Status
`reflex` is still highly experimental! Lots of things are still in progress.

# Roadmap
"grind and polish" cycles. let's just do two for now.

0.1 (grind) -- core object model. core types (bool, number, array, string, dict, tuple). mirrors and bindings. xml lit.

0.2 (polish) -- refactor, document, cleanup -- optimization, bugfixes

0.3 (grind) -- stdlib (files, network, math). modules/packages. traits, archetypes.

0.4 (polish) -- refactor, document, cleanup -- optimization, bugfixes

# Language
## Core Types
### Object
Every entity in the system descends from `Object`.
Interacts via messages dispatched through its native `send` method.
Objects have members whose values are other objects and which are distinguished by their attribute names.
By default object member attributes are readonly. That is, objects accept raw attribute writes only when the context is self (e.g., when inside an instance method).
Instance methods are distinguished function-valued members of an object which are inherited.

### Class
Every entity in the system also has a `Class`, which has a member `super` that is its parent class. The root of every object's ancestor chain is `Class(Object)`.
A special kind of class is a `Metaclass`, represents the class as an instance of an object. They are intended to be largely 'transparent'. The metaclass is accessible on a class object through the member `meta`.
Classes have a `new` function which generates a new object. Note the `new` for Class itself generates a new class object (`new(name, superclass)`).

### Function
A `Function` is a callable entity that can wrap a raw JS function or have a Reflex implementation.
Reflex functions can access locals both in their enclosing context and their context at definition.
### Nihil
`nil` is the object of class Nihil.
It is the (implicit) return value of empty functions, and the piped value of an exhausted generator.
## Syntax
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

## Principles

0. *Humanity matters.*
   Programming is a human activity, a social one, even if often performed in "isolation". 
   Language design choices seem abstract yet they are profoundly aesthetic and cultural,
   but beyond even this they have ethical and social meanings.
   Prefer not just DX, prioritize not only readability (although a deep concern with linguistics is part of
   this, i.e., part of the human-centric focus), but favor also deep consistency with human values.
   Design human-centered systems.

   Joy matters.
   Systems and processes organizing themselves around people and interactions is preferrable to the opposite.
   Computers promise enormous liberation from human futility, slavery, fear, indigence and drudgery.
   So:
   Liberate people. 
   

1. *Eloquence is brevity.*
  Don't seek a terminal minimalism of pure concatenative expressions or convoluted algebrae.
  Find expressive pathways through reflection and reification.
  Embrace the power of point-free programming while retaining the harness of an object model.
  Message dispatch is a universal model of communicating dynamic processes, so:
  Communicate dynamically. Capture ideas as languages. Get better at writing less.
  Think about cells.
  Embrace metalanguage where necessary to empower users, but keep reflective tools well isolated
  from object code.
  Avoid verbosity through seeking elegant and flexible languages for expressing problems.
  (Focus on the expression of problems rather than solutions.)
  A good object system is a self-reflecting servomechanism: a small problem statement generates a complete and complex solution.
  You can travel further if you are carrying less.

