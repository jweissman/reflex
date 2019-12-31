# reflex
a reflecting language

# Synopsis
a general-purpose, reflection-oriented language
this repo contains the grammar, the vm, cli harness

# Status
`reflex` is still highly experimental!

# Language
## Core Types
### Object
Every entity in the system descends from `Object`.
### Class
Every entity in the system also has a `Class`, which has a member `super` that is its parent class. The root of every object's ancestor chain is therefore `Class(Object)`.
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
## Message Dispatch
Most interactions with objects go through `send` on ReflexObject, which is going to check for instance 
methods on the object and then on parents/ancestors.
## First-class Functions
Any function you can invoke, you should be able to pass it around as an object in the system.