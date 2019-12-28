#!/usr/bin/env ts-node --project tsconfig.production.json

import reflex from '../src/reflex';
// let refl = new Refl();

const args = process.argv.slice(2);
if (args.length === 0) {
    reflex.repl();
} else {
    const fs = require('fs');
    const contents = fs.readFileSync(args[0]).toString();
    reflex.evaluate(contents);
}