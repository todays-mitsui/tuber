"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const immutable_1 = require("immutable");
const Expr_1 = require("./Types/Expr");
const ApplicationError_1 = require("./Error/ApplicationError");
class Func {
    constructor(callable) {
        this.params = callable.params;
        this.bareExpr = callable.bareExpr;
    }
    get arity() {
        return this.params.length;
    }
    get body() {
        return this.params.reduceRight((expr, identifier) => {
            return new Expr_1.Lambda(identifier, expr);
        }, this.bareExpr);
    }
    invoke(...args) {
        const pairs = ramda_1.zip(this.params, args);
        let body = this.bareExpr;
        for (let i = 0, len = pairs.length; i < len; i++) {
            const [param, expr] = pairs[i];
            body = body.rewrite(param, expr);
        }
        return body;
    }
    toJSON() {
        return {
            params: this.params,
            bareExpr: this.bareExpr.toJSON(),
        };
    }
}
class Context {
    constructor() {
        this.map = immutable_1.OrderedMap();
    }
    add(combinator, callable) {
        if (this.map.has(combinator.label)) {
            throw new ApplicationError_1.ApplicationError(`識別子 '${combinator.label}' はすでに定義されています`);
        }
        this.map = this.map.set(combinator.label, new Func(callable));
        return this;
    }
    update(combinator, callable) {
        this.map = this.map.set(combinator.label, new Func(callable));
        return this;
    }
    has(combinator) {
        return this.map.has(combinator.label);
    }
    get(combinator) {
        if (!this.map.has(combinator.label)) {
            return null;
        }
        return this.map.get(combinator.label);
    }
    get size() {
        return this.map.size;
    }
    get entories() {
        return this.map.toArray();
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map