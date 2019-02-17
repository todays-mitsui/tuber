import { ContextLoader } from '../ContextLoader'
import { Context } from '../Context'
import { Combinator, Expr, Identifier, ExprJSON } from '../Types/Expr'
import { Callable } from '../Types/Callable'
import { ApplicationError } from '../Error/ApplicationError'

interface ContextArchive {
    version: string
    context: {
        name: Identifier
        params: Identifier[]
        bareExpr: ExprJSON
    }[]
}

export class FromJSONContextLoader extends ContextLoader {
    private src: ContextArchive
    private context: Context

    public constructor(readonly json: ContextArchive, readonly basepath: string) {
        super()

        this.src = json
    }

    public load() {
        if (this.src.version !== '1.0') {
            throw new ApplicationError('不明なバージョンです')
        }

        let context = new Context()

        this.src.context.forEach(({ name, params, bareExpr }) => {
            const combinator = new Combinator(name)
            const callable = new Callable(params, Expr.fromJSON(bareExpr))

            context = context.update(combinator, callable)
        });

        return context
    }
}
