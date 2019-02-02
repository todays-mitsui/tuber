"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expr_1 = require("./Expr");
const Apply_1 = require("./Apply");
const Result_1 = require("../../Result");
class Symbl extends Expr_1.Expr {
    constructor(label) {
        super();
        this.label = label;
    }
    reduce(context) {
        return null;
    }
    tryReduce(context, route) {
        return new Result_1.Fail();
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
            type: Expr_1.ExprType.Symbol,
            label: this.label,
        };
    }
}
exports.Symbl = Symbl;
//# sourceMappingURL=Symbl.js.map