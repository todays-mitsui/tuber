import { ContextLoader } from '../ContextLoader'
import { Context } from '../Context'

export class EmptyContextLoader extends ContextLoader {
    private _context: Context

    public constructor() {
        super()

        this._context = new Context()
    }

    public load() {
        return this._context
    }
}
