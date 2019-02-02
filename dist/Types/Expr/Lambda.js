"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expr_1 = require("./Expr");
const Apply_1 = require("./Apply");
const Variable_1 = require("./Variable");
const Result_1 = require("../../Result");
class Lambda extends Expr_1.Expr {
    constructor(param, body) {
        super();
        this.param = param;
        this.body = body;
    }
    reduce(context) {
        return null;
    }
    tryReduce(context, route) {
        try {
            const [[arg], newRoute] = route.popRightTrees(1);
            return new Result_1.Just(newRoute.reassemble(this.invoke(context, [arg])));
        }
        catch (e) {
            return new Result_1.Fail();
        }
    }
    invoke(context, args) {
        const [head] = args.slice(0, 1);
        const tail = args.slice(1);
        return tail.reduce((expr, arg) => {
            return new Apply_1.Apply(expr, arg);
        }, this.rewrite(new Variable_1.Variable(this.param), head));
    }
    rewrite(variable, expr) {
        if (this.param === variable.label) {
            return this;
        }
        return new Lambda(this.param, this.body.rewrite(variable, expr));
    }
    toJSON() {
        return {
            type: Expr_1.ExprType.Lambda,
            param: this.param,
            body: this.body.toJSON(),
        };
    }
}
exports.Lambda = Lambda;
//# sourceMappingURL=Lambda.js.map