"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Calculator {
    constructor(contextLoader, chunk = 100) {
        this.contextLoader = contextLoader;
        this.chunk = chunk;
        this._context = this.contextLoader.load();
    }
    eval(expr) {
    }
    evalLast(expr) {
    }
    evalTail(expr) {
    }
    info(identifier) {
        return this._context.get(identifier);
    }
    get context() {
        return this._context.entories;
    }
}
exports.Calculator = Calculator;
//# sourceMappingURL=Calculator.js.map