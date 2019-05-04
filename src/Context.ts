import { OrderedMap, List } from 'immutable'

import { Identifier, Combinator } from './Types/Expr';
import { Callable } from './Types/Callable';
import { ApplicationError } from './Error/ApplicationError';
import { ContextArchive, ContextArchiveItem } from './Types/ContextArchive';

export class Context {
    private map:OrderedMap<Identifier, Callable>

    public constructor() {
        this.map = OrderedMap()
    }

    public add(combinator: Combinator, callable: Callable) {
        if (this.map.has(combinator.label)) {
            throw new ApplicationError(`識別子 '${combinator.label}' はすでに定義されています`)
        }

        this.map = this.map.set(combinator.label, callable)

        return this
    }

    public update(combinator: Combinator, callable: Callable) {
        this.map = this.map.set(combinator.label, callable)

        return this
    }

    public del(combinator: Combinator) {
        this.map = this.map.delete(combinator.label)

        return this
    }

    public has(combinator: Combinator) {
        return this.map.has(combinator.label)
    }

    public get(combinator: Combinator) {
        if (!this.map.has(combinator.label)) { return null }

        return this.map.get(combinator.label)
    }

    get size() {
        return this.map.size
    }

    get entories(): [Identifier, Callable][] {
        return this.map.toArray()
    }

    public dump(): ContextArchive {
        const context = this.map.toArray().map(([label, callable]) => ({
            name: label,
            ...callable.toJSON(),
        }))

        return {
            version: '1.0',
            context: context,
        }
    }
}
