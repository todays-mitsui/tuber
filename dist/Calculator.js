"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expr_1 = require("./Types/Expr");
const ApplicationError_1 = require("./Error/ApplicationError");
class Calculator {
    constructor(loader, chunkLength = 100) {
        this.loader = loader;
        this.chunkLength = chunkLength;
        this._context = this.loader.load();
        this._next = null;
    }
    eval(expr) {
        if (!expr && !this._next) {
            throw new ApplicationError_1.ApplicationError('簡約対象の式が指定されていません');
        }
        else if (!expr && this._next) {
            // expr が指定されない場合は、前回 eval 時の next を参照して簡約を実行する
            expr = this._next;
        }
        const [sequence, next] = this.sequence(expr);
        return {
            sequence,
            step: sequence.length - 1,
            done: next === null,
        };
    }
    sequence(expr) {
        let exprs = [expr];
        let next = this._next;
        while (exprs.length < this.chunkLength) {
            next = expr.reduce(this._context);
            if (next === null) {
                break;
            }
            exprs.push(next);
            expr = next;
        }
        this._next = next;
        return [exprs, next];
    }
    def(identifier, callable) {
        const combinator = new Expr_1.Combinator(identifier);
        this._context.update(combinator, callable);
        return this;
    }
    info(identifier) {
        const combinator = new Expr_1.Combinator(identifier);
        return this._context.get(combinator);
    }
    get context() {
        return this._context
            .entories
            .map(([name, body]) => ([name, body.toJSON()]));
    }
    get next() {
        return this._next;
    }
}
exports.Calculator = Calculator;
//# sourceMappingURL=Calculator.js.map