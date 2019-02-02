import { Expr, Identifier, ExprType } from "../Expr";
import { Context } from "../../Context";
import { Apply } from "./Apply";
import { Variable } from "./Variable";
import { Route } from "../../Route";
import { Just, Fail } from "../../Result";

export class Lambda extends Expr {
    public constructor(readonly param: Identifier, readonly body: Expr) {
        super()
    }

    public reduce(context: Context) {
        return null
    }

    public tryReduce(context: Context, route: Route) {
        try {
            const [[arg], newRoute] = route.popRightTrees(1)

            return new Just(newRoute.reassemble(this.invoke(context, [arg])))
        } catch (e) {
            return new Fail()
        }
    }

    public invoke(context: Context, args: Expr[]): Expr {
        const [head] = args.slice(0, 1);
        const tail = args.slice(1);

        return tail.reduce(
            (expr, arg) => {
                return new Apply(expr, arg)
            },
            this.rewrite(new Variable(this.param), head)
        )
    }

    public rewrite(variable: Variable, expr: Expr) {
        if (this.param === variable.label) { return this; }

        return new Lambda(this.param, this.body.rewrite(variable, expr))
    }

    public toJSON() {
        return {
            type: ExprType.Lambda,
            param: this.param,
            body: this.body.toJSON(),
        }
    }
}
