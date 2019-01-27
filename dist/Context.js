"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
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
            return {
                type: 'Lambda',
                param: identifier,
                body: expr,
            };
        }, this.bareExpr);
    }
}
class Context {
    constructor() {
        this.map = immutable_1.OrderedMap();
    }
    add(identifier, callable) {
        if (this.map.has(identifier)) {
            throw new ApplicationError_1.ApplicationError(`識別子 '${identifier}' はすでに定義されています`);
        }
        this.map = this.map.set(identifier, new Func(callable));
        return this;
    }
    update(identifier, callable) {
        this.map = this.map.set(identifier, new Func(callable));
        return this;
    }
    has(identifier) {
        return this.map.has(identifier);
    }
    get(identifier) {
        if (!this.map.has(identifier)) {
            return null;
        }
        return this.map.get(identifier);
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