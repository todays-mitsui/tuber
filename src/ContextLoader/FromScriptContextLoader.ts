import { ContextLoader } from '../ContextLoader'
import { Parser } from '../Types/Parser';
import { Context } from '../Context';
import { ApplicationError } from '../Error/ApplicationError';

export class FromScriptContextLoader extends ContextLoader {
    private context: Context

    public constructor(readonly filepath: string, private parser: Parser) {
        super()

        this.context = new Context()
    }

    public load() {
        // TODO: 実装
        throw new ApplicationError('TODO: 実装')

        return this.context
    }
}
