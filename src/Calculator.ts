import { ContextLoader } from './ContextLoader'
import { Expr, Combinator, Identifier } from './Types/Expr'
import { Context } from './Context'
import { Callable } from './Types/Callable'
import { ApplicationError } from './Error/ApplicationError'


export class Calculator {
    private _context: Context
    private _next: Expr

    constructor(private loader: ContextLoader, public chunkLength = 100) {
        this._context = this.loader.load()
        this._next = null
    }

    public eval(expr?: Expr) {
        if (!expr && !this._next) {
            throw new ApplicationError('簡約対象の式が指定されていません')
        } else if (!expr && this._next) {
            // expr が指定されない場合は、前回 eval 時の next を参照して簡約を実行する
            expr = this._next
        }

        const [sequence, next] = this.sequence(expr)

        return sequence
    }

    private sequence(expr: Expr): [Expr[], Expr] {
        let exprs = [expr]
        let next = this._next

        while (exprs.length < this.chunkLength) {
            next = expr.reduce(this._context)

            if (next === null) { break }

            exprs.push(next)
            expr = next
        }

        this._next = next

        return [exprs, next]
    }

    public info(combinator: Combinator) {
        return this._context.get(combinator)
    }

    get context() {
        return this._context.entories
    }

    get next(): Expr {
        return this._next;
    }
}