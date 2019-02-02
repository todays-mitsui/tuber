import { Expr, Identifier, ExprType } from "../Expr";
import { Context } from "../../Context";
import { Apply } from "./Apply";
import { Route } from "../../Route";
import { Fail } from "../../Result";

export class Variable extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Variable {
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

    public rewrite(variable: Variable, expr: Expr): Expr {
        return this.label === variable.label ? expr : this
    }

    public toJSON() {
        return {
            type: ExprType.Variable,
            label: this.label,
        }
    }
}
