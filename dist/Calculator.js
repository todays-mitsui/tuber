"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expr_1 = require("./Types/Expr");
const ApplicationError_1 = require("./Error/ApplicationError");
const EmptyContextLoader_1 = require("./ContextLoader/EmptyContextLoader");
class Calculator {
    constructor({ loader, dumper, chunkLength }) {
        this.loader = loader || new EmptyContextLoader_1.EmptyContextLoader();
        this.dumper = dumper;
        this.chunkLength = chunkLength || 100;
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
    del(identifier) {
        const combinator = new Expr_1.Combinator(identifier);
        this._context.del(combinator);
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
    dumpContext() {
        return typeof this.dumper === 'undefined'
            ? this._context.dump()
            : this.dumper.dump(this._context);
    }
}
exports.Calculator = Calculator;
//# sourceMappingURL=Calculator.js.map