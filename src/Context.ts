import { zip } from 'ramda'
import { OrderedMap } from 'immutable'

import { Identifier, Expr, Combinator, Lambda } from './Types/Expr';
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
                return new Lambda(identifier, expr)
            },
            this.bareExpr
        )
    }

    public invoke(...args: Expr[]): Expr {
        const pairs = zip(this.params, args);

        let body = this.bareExpr;

        for (let i = 0, len = pairs.length; i < len; i++) {
          const [param, expr] = pairs[i];

          body = body.rewrite(param, expr);
        }

        return body;
    }

    public toJSON() {
        return {
            params: this.params,
            bareExpr: this.bareExpr.toJSON(),
        }
    }
}

export class Context {
    private map:OrderedMap<Identifier, Func>

    public constructor() {
        this.map = OrderedMap()
    }

    public add(combinator: Combinator, callable: Callable) {
        if (this.map.has(combinator.label)) {
            throw new ApplicationError(`識別子 '${combinator.label}' はすでに定義されています`)
        }

        this.map = this.map.set(combinator.label, new Func(callable))

        return this
    }

    public update(combinator: Combinator, callable: Callable) {
        this.map = this.map.set(combinator.label, new Func(callable))

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
}
