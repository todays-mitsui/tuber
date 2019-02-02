"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expr_1 = require("../Expr");
const Apply_1 = require("./Apply");
const Result_1 = require("../../Result");
class Combinator extends Expr_1.Expr {
    constructor(label) {
        super();
        this.label = label;
    }
    reduce(context) {
        return null;
    }
    tryReduce(context, route) {
        const func = context.get(this);
        if (!func) {
            return new Result_1.Fail();
        }
        try {
            const arity = func.arity;
            const [args, newRoute] = route.popRightTrees(arity);
            return new Result_1.Just(newRoute.reassemble(this.invoke(context, args)));
        }
        catch (e) {
            return new Result_1.Fail();
        }
    }
    invoke(context, args) {
        return args.reduce((expr, arg) => {
            return new Apply_1.Apply(expr, arg);
        }, this);
    }
    rewrite(variable, expr) {
        return this;
    }
    toJSON() {
        return {
            type: Expr_1.ExprType.Combinator,
            label: this.label,
        };
    }
}
exports.Combinator = Combinator;
//# sourceMappingURL=Combinator.js.map