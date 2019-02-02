import { Expr, Identifier, ExprType } from "../Expr";
import { Context } from "../../Context";
import { Apply } from "./Apply";
import { Variable } from "./Variable";
import { Route } from "../../Route";
import { Just, Fail } from "../../Result";

export class Combinator extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Combinator {
        return null
    }

    public tryReduce(context: Context, route: Route) {
        const func = context.get(this)

        if (!func) { return new Fail() }

        try {
            const arity = func.arity
            const [args, newRoute] = route.popRightTrees(arity)

            return new Just(newRoute.reassemble(this.invoke(context, args)))
        } catch (e) {
            return new Fail()
        }
}

    public invoke(context: Context, args: Expr[]) {
        return args.reduce((expr, arg) => {
            return new Apply(expr, arg)
        }, this)
    }

    public rewrite(variable: Variable, expr: Expr): Combinator {
        return this
    }

    public toJSON() {
        return {
            type: ExprType.Combinator,
            label: this.label,
        }
    }
}
