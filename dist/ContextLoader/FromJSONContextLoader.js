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
        if (this.src.version === '1.0') {
            return this.readV1Src();
        }
        if (this.src.version === '2.0') {
            return this.readV2Src();
        }
        throw new ApplicationError_1.ApplicationError('不明なバージョンです');
    }
    readV1Src() {
        let context = new Context_1.Context();
        this.src.context.forEach(({ name, params, bareExpr }) => {
            const combinator = new Expr_1.Combinator(name);
            const callable = new Callable_1.Callable(params, Expr_1.Expr.fromJSON(bareExpr));
            context = context.update(combinator, callable);
        });
        return context;
    }
    readV2Src() {
        let context = new Context_1.Context();
        this.src.context.forEach(({ N, P, E }) => {
            const combinator = new Expr_1.Combinator(N);
            const bareExpr = this.translate(E);
            const callable = new Callable_1.Callable(P, Expr_1.Expr.fromJSON(bareExpr));
            context = context.update(combinator, callable);
        });
        return context;
    }
    translate(expr) {
        if ('V' in expr) {
            return {
                type: 'Variable',
                label: expr.V,
            };
        }
        if ('C' in expr) {
            return {
                type: 'Combinator',
                label: expr.C,
            };
        }
        if ('S' in expr) {
            return {
                type: 'Symbol',
                label: expr.S,
            };
        }
        if ('P' in expr && 'E' in expr) {
            return {
                type: 'Lambda',
                param: expr.P,
                body: this.translate(expr.E),
            };
        }
        if ('L' in expr && 'R' in expr) {
            return {
                type: 'Apply',
                left: this.translate(expr.L),
                right: this.translate(expr.R),
            };
        }
    }
}
exports.FromJSONContextLoader = FromJSONContextLoader;
//# sourceMappingURL=FromJSONContextLoader.js.map