"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContextLoader_1 = require("../ContextLoader");
const Context_1 = require("../Context");
const Expr_1 = require("../Types/Expr");
const Callable_1 = require("../Types/Callable");
class FromJSONContextLoader extends ContextLoader_1.ContextLoader {
    constructor(filepath, basepath) {
        super();
        this.filepath = filepath;
        this.basepath = basepath;
        this.context = new Context_1.Context();
    }
    load() {
        const src = require(this.filepath);
        if (this.context.size > 0) {
            return this.context;
        }
        src.context.forEach(({ name, params, bareExpr }) => {
            const combinator = new Expr_1.Combinator(name);
            const callable = new Callable_1.Callable(params, Expr_1.Expr.fromJSON(bareExpr));
            this.context = this.context.update(combinator, callable);
        });
        return this.context;
    }
}
exports.FromJSONContextLoader = FromJSONContextLoader;
//# sourceMappingURL=FromJSONContextLoader.js.map