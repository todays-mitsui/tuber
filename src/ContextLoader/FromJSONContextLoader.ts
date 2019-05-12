import { ContextLoader } from '../ContextLoader'
import { Context } from '../Context'
import { Combinator, Expr, ExprJSON } from '../Types/Expr'
import { Callable } from '../Types/Callable'
import { ApplicationError } from '../Error/ApplicationError'
import { ContextArchive } from '../Types/ContextArchive';
import { ExprArchive, ContextArchiveV2 } from '../Types/ContextArchiveV2';


export class FromJSONContextLoader extends ContextLoader {
    private src: ContextArchive|ContextArchiveV2
    private context: Context

    public constructor(
        readonly json: ContextArchive|ContextArchiveV2,
        readonly basepath: string
    ) {
        super()

        this.src = json
    }

    public load() {
        if (!['1.0', '2.0'].includes(this.src.version)) {
            throw new ApplicationError('不明なバージョンです')
        }


        let context = new Context()

        for (let i = 0, len = this.src.context.length; i < len; i ++) {
            const contextItem = this.src.context[i]

            if (
                'name' in contextItem
                && 'params' in contextItem
                && 'bareExpr' in contextItem
            ) {
                const { name, params, bareExpr } = contextItem

                const combinator = new Combinator(name)
                const callable = new Callable(params, Expr.fromJSON(bareExpr))

                context = context.update(combinator, callable)
            } else if (
                'N' in contextItem
                && 'P' in contextItem
                && 'E' in contextItem
            ) {
                const { N, P, E } = contextItem

                const combinator = new Combinator(N)
                const callable = new Callable(P, Expr.restore(E))

                context = context.update(combinator, callable)
            }
        }

        return context
    }
}
