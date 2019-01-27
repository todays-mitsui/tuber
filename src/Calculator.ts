import { ContextLoader } from "./ContextLoader";
import { Expr, Identifier } from "./Types/Expr";
import { Context } from "./Context";

export class Calculator {
    private _context: Context

    constructor(private contextLoader: ContextLoader, public chunk = 100) {
        this._context = this.contextLoader.load()
    }

    public eval(expr: Expr) {
    }

    public evalLast(expr: Expr) {
    }

    public evalTail(expr: Expr) {
    }

    public info(identifier: Identifier) {
        return this._context.get(identifier)
    }

    get context() {
        return this._context.entories
    }
}
