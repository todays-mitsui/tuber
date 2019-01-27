import { OrderedMap } from 'immutable'
import { Identifier, Expr, Lambda } from './Types/Expr';
import { Callable } from './Types/Callable';
import { ApplicationError } from './Error/ApplicationError';

class Func implements Callable {
    public params: Identifier[]
    public bareExpr: Expr

    public constructor(callable: Callable) {
        this.params = callable.params
        this.bareExpr = callable.bareExpr
    }

    get arity() {
        return this.params.length
    }

    get body() {
        return this.params.reduceRight(
            (expr: Expr, identifier: Identifier): Lambda => {
                return {
                    type: 'Lambda',
                    param: identifier,
                    body: expr,
                }
            },
            this.bareExpr
        )
    }
}

export class Context {
    private map:OrderedMap<Identifier, Func>

    public constructor() {
        this.map = OrderedMap()
    }

    public add(identifier: Identifier, callable: Callable) {
        if (this.map.has(identifier)) {
            throw new ApplicationError(`識別子 '${identifier}' はすでに定義されています`)
        }

        this.map = this.map.set(identifier, new Func(callable))

        return this
    }

    public update(identifier: Identifier, callable: Callable) {
        this.map = this.map.set(identifier, new Func(callable))

        return this
    }

    public has(identifier: Identifier) {
        return this.map.has(identifier)
    }

    public get(identifier: Identifier) {
        if (!this.map.has(identifier)) { return null }

        return this.map.get(identifier)
    }

    get size() {
        return this.map.size
    }

    get entories(): [Identifier, Callable][] {
        return this.map.toArray()
    }
}
