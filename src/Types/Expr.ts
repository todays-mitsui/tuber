import { Context } from "../Context";
import { ToJSON } from "../Interface/ToJSON";
import { Route } from "../Route";
import { Result, Just, Try, Fail } from "../Result";
import { Stack } from "immutable";
import { ApplicationError } from "../Error/ApplicationError";


export type ExprType = 'Variable' | 'Combinator' | 'Symbol' | 'Lambda' | 'Apply'


export type ExprJSON = VariableJSON | CombinatorJSON | SymblJSON | LambdaJSON | ApplyJSON

export interface VariableJSON {
    type: 'Variable',
    label: Identifier,
    [key: string]: any,
}

export interface CombinatorJSON {
    type: 'Combinator',
    label: Identifier,
    [key: string]: any,
}

export interface SymblJSON {
    type: 'Symbol',
    label: Identifier,
    [key: string]: any,
}

export interface LambdaJSON {
    type: 'Lambda',
    param: Identifier,
    body: ExprJSON,
    [key: string]: any,
}

export interface ApplyJSON {
    type: 'Apply',
    left: ExprJSON,
    right: ExprJSON,
    [key: string]: any,
}


export abstract class Expr implements ToJSON {
    abstract reduce(context: Context): Expr
    abstract tryReduce(context: Context, route: Route): Result
    // abstract invoke(context: Context, args: Expr[]): Expr
    abstract rewrite(identifier: Identifier, expr: Expr): Expr

    static fromJSON(json: ExprJSON): Expr {
        switch (json.type) {
            case 'Variable': {
                return new Variable(json.label)
            }

            case 'Combinator': {
                return new Combinator(json.label)
            }

            case 'Symbol': {
                return new Symbl(json.label)
            }

            case 'Lambda': {
                return new Lambda(json.param, Expr.fromJSON(json.body))
            }

            case 'Apply': {
                return new Apply(Expr.fromJSON(json.left), Expr.fromJSON(json.right))
            }
        }
    }

    abstract toJSON(): ExprJSON
}

export type Identifier = string


export class Variable extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Variable {
        return null
    }

    public tryReduce(context: Context, route: Route) {
        return new Fail()
    }

    public rewrite(identifier: Identifier, expr: Expr): Expr {
        return this.label === identifier ? expr : this
    }

    public toJSON(): VariableJSON {
        return {
            type: 'Variable',
            label: this.label,
        }
    }
}


export class Combinator extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Combinator {
        return null
    }

    public tryReduce(context: Context, route: Route) {
        const callable = context.get(this)

        if (!callable) { return new Fail() }

        try {
            const arity = callable.arity
            const [args, newRoute] = route.popRightTrees(arity)

            return new Just(newRoute.reassemble(callable.call(...args)))
        } catch (e) {
            return new Fail()
        }
    }

    public rewrite(identifier: Identifier, expr: Expr): Combinator {
        return this
    }

    public toJSON(): CombinatorJSON {
        return {
            type: 'Combinator',
            label: this.label,
        }
    }
}


export class Symbl extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Symbl {
        return null
    }

    public tryReduce(context: Context, route: Route) {
        return new Fail()
    }

    public rewrite(identifier: Identifier, expr: Expr): Symbl {
        return this
    }

    public toJSON(): SymblJSON {
        return {
            type: 'Symbol',
            label: this.label,
        }
    }
}


export class Lambda extends Expr {
    public constructor(readonly param: Identifier, readonly body: Expr) {
        super()
    }

    public reduce(context: Context) {
        return null
    }

    public tryReduce(context: Context, route: Route) {
        try {
            const [[arg], newRoute] = route.popRightTrees(1)

            return new Just(newRoute.reassemble(this.body.rewrite(this.param, arg)))
        } catch (e) {
            return new Fail()
        }
    }

    public rewrite(identifier: Identifier, expr: Expr) {
        if (this.param === identifier) { return this; }

        return new Lambda(this.param, this.body.rewrite(identifier, expr))
    }

    public toJSON(): LambdaJSON {
        return {
            type: 'Lambda',
            param: this.param,
            body: this.body.toJSON(),
        }
    }
}


export class Apply extends Expr {
    public constructor(readonly left: Expr, readonly right: Expr) {
        super()
    }

    public reduce(context: Context): Expr {
        let tryStack = Stack.of(
            [this.left , Route.root().goLeft(this.right)],
            [this.right, Route.root().goRight(this.left)]
        ) as Stack<[Expr, Route]>

        do {
            const [current, route] = tryStack.first()
            tryStack = tryStack.shift()

            let result = current.tryReduce(context, route)

            if (result instanceof Try) {
                tryStack = tryStack.push(...result.val)
            } else if (result instanceof Just) {
                return result.val
            }
        } while (!tryStack.isEmpty())

        return null as Expr
    }

    public tryReduce(context: Context, route: Route): Result {
        return new Try([
            [this.left , route.goLeft(this.right)],
            [this.right, route.goRight(this.left)],
        ])
    }

    public rewrite(identifier: Identifier, expr: Expr) {
        return new Apply(
            this.left.rewrite(identifier, expr),
            this.right.rewrite(identifier, expr)
        )
    }

    public toJSON(): ApplyJSON {
        return {
            type: 'Apply',
            left: this.left.toJSON(),
            right: this.right.toJSON(),
        }
    }
}
