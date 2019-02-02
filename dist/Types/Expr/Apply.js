"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const Expr_1 = require("./Expr");
const Route_1 = require("../../Route");
const Result_1 = require("../../Result");
class Apply extends Expr_1.Expr {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    reduce(context) {
        let [current, route] = [this.left, Route_1.Route.root().goLeft(this.right)];
        let tryStack = immutable_1.Stack.of([this.right, Route_1.Route.root().goRight(this.left)]);
        do {
            let result = current.tryReduce(context, route);
            if (result instanceof Result_1.Try) {
                tryStack = tryStack.push(...result.val);
            }
            else if (result instanceof Result_1.Just) {
                return result.val;
            }
            [current, route] = tryStack.first();
            tryStack = tryStack.shift();
        } while (!tryStack.isEmpty());
        return undefined;
    }
    tryReduce(context, route) {
        return new Result_1.Try([
            [this.left, route.goLeft(this.right)],
            [this.right, route.goLeft(this.left)],
        ]);
    }
    invoke(context, args) {
        return undefined;
    }
    rewrite(variable, expr) {
        return new Apply(this.left.rewrite(variable, expr), this.right.rewrite(variable, expr));
    }
    toJSON() {
        return {
            type: Expr_1.ExprType.Apply,
            left: this.left.toJSON(),
            right: this.right.toJSON(),
        };
    }
}
exports.Apply = Apply;
//# sourceMappingURL=Apply.js.map