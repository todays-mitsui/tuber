import { Identifier, ExprJSON } from "./Expr";


export interface ContextArchiveV2 {
    version: '2.0'
    context: ContextArchiveV2Item[]
}

export interface ContextArchiveV2Item {
    N: Identifier
    P: Identifier[]
    E: ExprArchive
}

export type ExprArchive =
    VariableArchive
    | CombinatorArchive
    | SymblArchive
    | LambdaArchive
    | ApplyArchive

export interface VariableArchive {
    V: Identifier,
    [key: string]: any,
}

export interface CombinatorArchive {
    C: Identifier,
    [key: string]: any,
}

export interface SymblArchive {
    S: Identifier,
    [key: string]: any,
}

export interface LambdaArchive {
    P: Identifier,
    E: ExprArchive,
    [key: string]: any,
}

export interface ApplyArchive {
    L: ExprArchive,
    R: ExprArchive,
    [key: string]: any,
}
