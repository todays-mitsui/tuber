"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContextLoader_1 = require("../ContextLoader");
const Context_1 = require("../Context");
const Expr_1 = require("../Types/Expr");
const Callable_1 = require("../Types/Callable");
class ContextLoaderFromJSON extends ContextLoader_1.ContextLoader {
    constructor(filepath) {
        super();
        this.filepath = filepath;
        this.context = new Context_1.Context;
    }
    load() {
        const src = require(this.filepath);
        if (this.context.size > 0) {
            return this.context;
        }
        this.context = src.context.array.forEach(({ name, params, bareExpr }) => {
            const combinator = new Expr_1.Combinator(name);
            const callable = new Callable_1.Callable(params, Expr_1.Expr.fromJSON(bareExpr));
            this.context.update(combinator, callable);
        });
        return this.context;
    }
}
exports.ContextLoaderFromJSON = ContextLoaderFromJSON;
//# sourceMappingURL=ContextLoaderFromJSON.js.map