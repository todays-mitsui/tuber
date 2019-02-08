import { ContextLoader } from "./ContextLoader";
import { Expr, Combinator, Identifier } from "./Types/Expr";
import { Context } from "./Context";
import { Callable } from "./Types/Callable";
import { ExprParser } from "./Parser/ES2015StyleParser";

export class Calculator {
    private _context: Context
    private next: Expr

    constructor(private loader: ContextLoader, public chunkLength = 100) {
        this._context = this.loader.load()
    }

    private sequence(expr: Expr): [Expr[], Expr] {
        let exprs = [expr]
        let next = this.next

        while (exprs.length < this.chunkLength) {
            next = expr.reduce(this._context)

            if (next === null) { break }

            exprs.push(next)
            expr = next
        }

        this.next = next

        return [exprs, next]
    }

    public eval(expr: Expr) {
        const [sequence, next] = this.sequence(expr)

        return sequence
    }

    public evalLast(expr: Expr) {
    }

    public evalTail(expr: Expr) {
    }

    public info(combinator: Combinator) {
        return this._context.get(combinator)
    }

    get context(): [Identifier, Callable][] {
        return this._context.entories
    }
}
