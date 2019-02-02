import { Expr, Identifier, ExprType } from "../Expr";
import { Context } from "../../Context";
import { Apply } from "./Apply";
import { Variable } from "./Variable";
import { Fail } from "../../Result";
import { Route } from "../../Route";

export class Symbl extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Symbl {
        return null
    }

    public tryReduce(context: Context, route: Route) {
        return new Fail()
    }

    public invoke(context: Context, args: Expr[]) {
        return args.reduce((expr, arg) => {
            return new Apply(expr, arg)
        }, this)
    }

    public rewrite(variable: Variable, expr: Expr): Symbl {
        return this
    }

    public toJSON() {
        return {
            type: ExprType.Symbol,
            label: this.label,
        }
    }
}
