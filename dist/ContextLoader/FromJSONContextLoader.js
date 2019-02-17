"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContextLoader_1 = require("../ContextLoader");
const Context_1 = require("../Context");
const Expr_1 = require("../Types/Expr");
const Callable_1 = require("../Types/Callable");
const ApplicationError_1 = require("../Error/ApplicationError");
class FromJSONContextLoader extends ContextLoader_1.ContextLoader {
    constructor(json, basepath) {
        super();
        this.json = json;
        this.basepath = basepath;
        this.src = json;
    }
    load() {
        if (this.src.version !== '1.0') {
            throw new ApplicationError_1.ApplicationError('不明なバージョンです');
        }
        let context = new Context_1.Context();
        this.src.context.forEach(({ name, params, bareExpr }) => {
            const combinator = new Expr_1.Combinator(name);
            const callable = new Callable_1.Callable(params, Expr_1.Expr.fromJSON(bareExpr));
            context = context.update(combinator, callable);
        });
        return context;
    }
}
exports.FromJSONContextLoader = FromJSONContextLoader;
//# sourceMappingURL=FromJSONContextLoader.js.map