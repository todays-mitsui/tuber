"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Focus_1 = require("./Focus");
const immutable_1 = require("immutable");
class Calculator {
    constructor(contextLoader, chunk = 100) {
        this.contextLoader = contextLoader;
        this.chunk = chunk;
        this._context = this.contextLoader.load();
    }
    eval(expr) {
        const focus = new Focus_1.Focus(expr);
        const tryStack = immutable_1.Stack();
        Calculator.traverse(focus);
    }
    static traverse() {
    }
    static _reduce(focus) {
        focus;
    }
    evalLast(expr) {
    }
    evalTail(expr) {
    }
    info(combinator) {
        return this._context.get(combinator);
    }
    get context() {
        return this._context.entories;
    }
}
exports.Calculator = Calculator;
//# sourceMappingURL=Calculator.js.map