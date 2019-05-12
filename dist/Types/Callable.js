"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expr_1 = require("./Expr");
class Callable {
    constructor(params, bareExpr) {
        this.params = params;
        this.bareExpr = bareExpr;
    }
    get arity() {
        return this.params.length;
    }
    get body() {
        return this.params.reduceRight((expr, identifier) => {
            return new Expr_1.Lambda(identifier, expr);
        }, this.bareExpr);
    }
    call(...args) {
        let body = this.bareExpr;
        for (let i = 0, len = this.params.length; i < len; i++) {
            const param = this.params[i];
            const expr = args[i];
            body = body.rewrite(param, expr);
        }
        return body;
    }
    static fromJSON(json) {
        return new Callable(json.params, Expr_1.Expr.fromJSON(json.bareExpr));
    }
    toJSON() {
        return {
            params: this.params,
            bareExpr: this.bareExpr.toJSON(),
        };
    }
    static restore(json) {
        return new Callable(json.P, Expr_1.Expr.restore(json.E));
    }
    dump() {
        return {
            P: this.params,
            E: this.bareExpr.dump(),
        };
    }
}
exports.Callable = Callable;
//# sourceMappingURL=Callable.js.map