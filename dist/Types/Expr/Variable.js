"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expr_1 = require("../Expr");
const Apply_1 = require("./Apply");
const Result_1 = require("../../Result");
class Variable extends Expr_1.Expr {
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
        return this.label === variable.label ? expr : this;
    }
    toJSON() {
        return {
            type: Expr_1.ExprType.Variable,
            label: this.label,
        };
    }
}
exports.Variable = Variable;
//# sourceMappingURL=Variable.js.map