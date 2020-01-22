# reflex

🤖 Explore a new GENERAL-PURPOSE language

💎 Write clear code with CRYSTALLINE ELEGANCE 

🕵🏻‍ Use reification and REFLECTION

🎉 Write XML LITERALS natively

🥂 Interoperate with JAVASCRIPT

🥳 Enjoy METAPROGRAMMING

# Synopsis

A general-purpose, reflection-oriented language for the contemporary web.

# About

A reflecting language, inspired by Ruby, Eiffel, Self, Smalltalk.
This repo contains the grammar, the vm and the cli harness.
Implemented in Typescript.

# Getting Started

```
3.times { puts "hello world!" }
```

Some basic examples should be working now, but there's still a lot in active development.

```
using 'paint'
paint = Paint.new()

class Greeter {
    init() {
        self.greeting = 'Hello, '
    }

    greet(subject) {
        self.greeting + paint.blue(subject)
    }
}

greeter = Greeter.new()
greeter.greet("world")
```

For more examples take a look at the [preamble](src/reflex/lib/Preamble.reflex) which defines the standard library in a few hundred lines of Reflex.
Consider referring also to [the specs](src/reflex/Reflex.spec.ts) which have lots of Reflex code examples with their expected outputs.
A [fledgling language reference](LANGUAGE.md) is also available.

# Status
`reflex` is still highly experimental! Lots of things are still in progress.

The `reflex` command line tool should act both as a runner and an interpreter shell (repl).
(Without args, it is a repl; give it a file and it will interpret as Reflex.)

# Roadmap
"grind and polish" cycles. let's just do two for now.

0.1 (grind) -- core object model. core types (bool, number, array, string, dict, tuple). mirrors and bindings. xml lit.

0.2 (polish) -- refactor, document, cleanup -- optimization, bugfixes

0.3 (grind) -- stdlib (files, network, math). modules/packages. traits, archetypes.

0.4 (polish) -- refactor, document, cleanup -- optimization, bugfixes

