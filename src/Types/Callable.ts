import { Identifier, Expr, Lambda, ExprJSON } from "./Expr";
import { ToJSON } from "../Interface/ToJSON";
import { Dump } from "../Interface/Dump";
import { ExprArchive } from "./ContextArchiveV2";

export class Callable implements ToJSON, Dump {
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

    public static fromJSON(json: { params: Identifier[], bareExpr: ExprJSON }) {
        return new Callable(json.params, Expr.fromJSON(json.bareExpr))
    }

    public toJSON(): { params: Identifier[], bareExpr: ExprJSON } {
        return {
            params: this.params,
            bareExpr: this.bareExpr.toJSON(),
        }
    }

    public static restore(json: { P: Identifier[], E: ExprArchive }) {
        return new Callable(json.P, Expr.restore(json.E))
    }

    public dump(): { P: Identifier[], E: ExprArchive } {
        return {
            P: this.params,
            E: this.bareExpr.dump(),
        }
    }
}
