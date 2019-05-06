import { Context } from '../Context'
import { ContextDumper } from '../ContextDumper';
import { ExprJSON } from '../Types/Expr';
import { ExprArchive, ContextArchiveV2 } from '../Types/ContextArchiveV2';

export class ContextDumperV2 extends ContextDumper {
    public dump(context: Context): ContextArchiveV2 {
        const translated = context.entories.map(([label, callable]) => {
            const callableJson = callable.toJSON()

            return {
                N: label,
                P: callableJson.params,
                E: this.translate(callableJson.bareExpr)
            }
        })

        return {
            version: '2.0',
            context: translated,
        }
    }

    private translate(expr: ExprJSON): ExprArchive {
        switch (expr.type) {
            case 'Variable':
                return { V: expr.label }

            case 'Combinator':
                return { C: expr.label }

            case 'Symbol':
                return { S: expr.label }

            case 'Lambda':
                return {
                    P: expr.param,
                    E: this.translate(expr.body),
                }

            case 'Apply':
                return {
                    L: this.translate(expr.left),
                    R: this.translate(expr.right),
                }
        }
    }
}
