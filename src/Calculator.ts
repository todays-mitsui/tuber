import { ContextLoader } from "./ContextLoader";
import { Expr } from "./Types/Expr";
import { Context } from "./Context";
import { Stack } from "immutable";
import { Combinator } from "./Types/Expr/Combinator";

export class Calculator {
    private _context: Context

    constructor(private contextLoader: ContextLoader, public chunk = 100) {
        this._context = this.contextLoader.load()
    }

    static traverse() {

    }

    public evalLast(expr: Expr) {
    }

    public evalTail(expr: Expr) {
    }

    public info(combinator: Combinator) {
        return this._context.get(combinator)
    }

    get context() {
        return this._context.entories
    }
}
