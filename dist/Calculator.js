"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Calculator {
    constructor(loader, chunkLength = 100) {
        this.loader = loader;
        this.chunkLength = chunkLength;
        this._context = this.loader.load();
    }
    sequence(expr) {
        let exprs = [expr];
        let next = this.next;
        while (exprs.length < this.chunkLength) {
            next = expr.reduce(this._context);
            if (next === null) {
                break;
            }
            exprs.push(next);
            expr = next;
        }
        this.next = next;
        return [exprs, next];
    }
    eval(expr) {
        const [sequence, next] = this.sequence(expr);
        return sequence;
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