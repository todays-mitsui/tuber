import { Context } from "../Context";
import { ToJSON } from "../Interface/ToJSON";

export type ExprType = 'Variable' | 'Combinator' | 'Symbol' | 'Lambda' | 'Apply'
export namespace ExprType {
    export const Variable  : ExprType = 'Variable'
    export const Combinator: ExprType = 'Combinator'
    export const Symbol    : ExprType = 'Symbol'
    export const Lambda    : ExprType = 'Lambda'
    export const Apply     : ExprType = 'Apply'
}

type ExprJSON = VariableJSON | CombinatorJSON | SymblJSON | LambdaJSON | ApplyJSON

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
    // abstract sequence(context: Context, maxLength?: number): [Expr[], Expr]
    abstract reduce(context: Context): Expr
    abstract invoke(context: Context, args: Expr[]): Expr
    abstract rewrite(variable: Variable, expr: Expr): Expr

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

    abstract toJSON(): Object
}

export class Variable extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Variable {
        return null
    }

    public invoke(context: Context, args: Expr[]) {
        return args.reduce((expr, arg) => {
            return new Apply(expr, arg)
        }, this)
    }

    public rewrite(variable: Variable, expr: Expr): Expr {
        return this.label === variable.label ? expr : this
    }

    public toJSON() {
        return {
            type: ExprType.Variable,
            label: this.label,
        }
    }
}

// export interface Variable {
//     type: 'Variable',
//     label: Identifier,
// }

// export interface Combinator {
//     type: 'Combinator',
//     label: Identifier,
// }

export class Combinator extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Combinator {
        return null
    }

    public invoke(context: Context, args: Expr[]) {
        return args.reduce((expr, arg) => {
            return new Apply(expr, arg)
        }, this)
    }

    public rewrite(variable: Variable, expr: Expr): Combinator {
        return this
    }

    public toJSON() {
        return {
            type: ExprType.Combinator,
            label: this.label,
        }
    }
}


// export interface Symbl {
//     type: 'Symbol',
//     label: Identifier,
// }

export class Symbl extends Expr {
    public constructor(readonly label: Identifier) {
        super()
    }

    public reduce(context: Context): Symbl {
        return null
    }

    public invoke(context: Context, args: Expr[]) {
        return args.reduce((expr, arg) => {
            return new Apply(expr, arg)
        }, this)
    }

    public rewrite(variable: Variable, expr: Expr): Symbl {
        return this
    }

    public toJSON() {
        return {
            type: ExprType.Symbol,
            label: this.label,
        }
    }
}

// export interface Lambda {
//     type: 'Lambda',
//     param: Identifier,
//     body: Expr,
// }

export class Lambda extends Expr {
    public constructor(readonly param: Identifier, readonly body: Expr) {
        super()
    }

    public reduce(context: Context): Lambda {
        return null
    }

    public invoke(context: Context, args: Expr[]): Expr {
        const [head] = args.slice(0, 1);
        const tail = args.slice(1);

        return tail.reduce(
            (expr, arg) => {
                return new Apply(expr, arg)
            },
            this.rewrite(new Variable(this.param), head)
        )
    }

    public rewrite(variable: Variable, expr: Expr) {
        if (this.param === variable.label) { return this; }

        return new Lambda(this.param, this.body.rewrite(variable, expr))
    }

    public toJSON() {
        return {
            type: ExprType.Lambda,
            param: this.param,
            body: this.body.toJSON(),
        }
    }
}

// export interface Apply {
//     type: 'Apply',
//     left: Expr,
//     right: Expr,
// }

export class Apply extends Expr {
    public constructor(readonly left: Expr, readonly right: Expr) {
        super()
    }

    public reduce(context: Context): Expr {
        return undefined as Expr
    }

    public invoke(context: Context, args: Expr[]): Expr {
        return undefined as Expr
    }

    public rewrite(variable: Variable, expr: Expr) {
        return new Apply(
            this.left.rewrite(variable, expr),
            this.right.rewrite(variable, expr)
        )
    }

    public toJSON() {
        return {
            type: ExprType.Apply,
            left: this.left.toJSON(),
            right: this.right.toJSON(),
        }
    }
}

export type Identifier = string
