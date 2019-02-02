import { Context } from "../Context";
import { ToJSON } from "../Interface/ToJSON";
import { Route } from "../Route";
import { Result } from "../Result";
import { Lambda } from "./Expr/Lambda";
import { Apply } from "./Expr/Apply";
import { Variable } from "./Expr/Variable";
import { Combinator } from "./Expr/Combinator";
import { Symbl } from "./Expr/Symbl";

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
    abstract reduce(context: Context): Expr
    abstract tryReduce(context: Context, route: Route): Result
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

export type Identifier = string
