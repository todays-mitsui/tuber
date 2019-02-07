import { ContextLoader } from '../ContextLoader'
import { Context } from '../Context';
import { Combinator, Expr } from '../Types/Expr';
import { Callable } from '../Types/Callable';

export class ContextLoaderFromJSON extends ContextLoader {
    private context: Context

    public constructor(readonly filepath: string) {
        super()

        this.context = new Context
    }

    public load() {
        const src = require(this.filepath)

        if (this.context.size > 0) { return this.context }

        src.context.forEach(({ name, params, bareExpr }) => {
            const combinator = new Combinator(name)
            const callable = new Callable(params, Expr.fromJSON(bareExpr))

            this.context = this.context.update(combinator, callable)
        });

        return this.context
    }
}
