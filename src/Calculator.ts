import { ContextLoader } from "./ContextLoader";
import { Expr, Identifier, Combinator } from "./Types/Expr";
import { Context } from "./Context";
import { Focus } from "./Focus";
import { Stack } from "immutable";

export class Calculator {
    private _context: Context

    constructor(private contextLoader: ContextLoader, public chunk = 100) {
        this._context = this.contextLoader.load()
    }

    public eval(expr: Expr): [Expr[], Focus] {
        const focus = new Focus(expr)
        const tryStack = Stack()

        Calculator.traverse(focus, )
    }

    static traverse() {

    }

    static _reduce(focus: Focus): Expr|Focus[]|null {
        focus
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
