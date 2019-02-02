import { Stack } from "immutable";

import { Expr, ExprType } from "../Expr";
import { Variable } from "./Variable";
import { Context } from "../../Context";
import { Route } from "../../Route";
import { Result, Just, Try } from "../../Result";


export class Apply extends Expr {
    public constructor(readonly left: Expr, readonly right: Expr) {
        super()
    }

    public reduce(context: Context): Expr {
        let [current, route] = [this.left, Route.root().goLeft(this.right)]
        let tryStack = Stack.of([this.right, Route.root().goRight(this.left)]) as Stack<[Expr, Route]>

        do {
            let result = current.tryReduce(context, route)

            if (result instanceof Try) {
                tryStack = tryStack.push(...result.val)
            } else if (result instanceof Just) {
                return result.val
            }

            [current, route] = tryStack.first()
            tryStack = tryStack.shift()
        } while (!tryStack.isEmpty())

        return undefined as Expr
    }

    public tryReduce(context: Context, route: Route): Result {
        return new Try([
            [this.left , route.goLeft(this.right)],
            [this.right, route.goLeft(this.left)],
        ])
    }

    public invoke(context: Context, args: Expr[]): Expr {
        return undefined as Expr
    }

    public rewrite(variable: Variable, expr: Expr) {
        return new Apply(
            this.left.rewrite(variable, expr),
            this.right.rewrite(variable, expr)
        )
    }

    public toJSON() {
        return {
            type: ExprType.Apply,
            left: this.left.toJSON(),
            right: this.right.toJSON(),
        }
    }
}
