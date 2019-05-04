import { Identifier, Expr, Lambda, ExprJSON } from "./Expr";
import { ToJSON } from "../Interface/ToJSON";

export class Callable implements ToJSON {
    public constructor(readonly params: Identifier[], readonly bareExpr: Expr) {
    }

    get arity() {
        return this.params.length
    }

    get body() {
        return this.params.reduceRight(
            (expr: Expr, identifier: Identifier): Lambda => {
                return new Lambda(identifier, expr)
            },
            this.bareExpr
        )
    }

    public call(...args: Expr[]): Expr {
        let body = this.bareExpr;

        for (let i = 0, len = this.params.length; i < len; i++) {
            const param = this.params[i]
            const expr = args[i]

            body = body.rewrite(param, expr);
        }

        return body;
    }

    public toJSON(): { params: Identifier[], bareExpr: ExprJSON } {
        return {
            params: this.params,
            bareExpr: this.bareExpr.toJSON(),
        }
    }
}
