import { ContextLoader } from '../ContextLoader'
import { Context } from '../Context'
import { Combinator, Expr, Identifier, ExprJSON } from '../Types/Expr'
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
        if (this.src.version === '1.0') { return this.readV1Src() }

        if (this.src.version === '2.0') { return this.readV2Src() }

        throw new ApplicationError('不明なバージョンです')
    }

    private readV1Src(): Context {
        let context = new Context()

        this.src.context.forEach(({ name, params, bareExpr }) => {
            const combinator = new Combinator(name)
            const callable = new Callable(params, Expr.fromJSON(bareExpr))

            context = context.update(combinator, callable)
        });

        return context
    }

    private readV2Src(): Context {
        let context = new Context()

        this.src.context.forEach(({ N, P, E }) => {
            const combinator = new Combinator(N)
            const bareExpr = this.translate(E)
            const callable = new Callable(P, Expr.fromJSON(bareExpr))

            context = context.update(combinator, callable)
        });

        return context
    }

    private translate(expr: ExprArchive): ExprJSON {
        if ('V' in expr) {
            return {
                type: 'Variable',
                label: expr.V,
            }
        }

        if ('C' in expr) {
            return {
                type: 'Combinator',
                label: expr.C,
            }
        }

        if ('S' in expr) {
            return {
                type: 'Symbol',
                label: expr.S,
            }
        }

        if ('P' in expr && 'E' in expr) {
            return {
                type: 'Lambda',
                param: expr.P,
                body: this.translate(expr.E),
            }
        }

        if ('L' in expr && 'R' in expr) {
            return {
                type: 'Apply',
                left: this.translate(expr.L),
                right: this.translate(expr.R),
            }
        }
    }
}
