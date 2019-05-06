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

interface VariableArchive {
    V: Identifier,
    [key: string]: any,
}

interface CombinatorArchive {
    C: Identifier,
    [key: string]: any,
}

interface SymblArchive {
    S: Identifier,
    [key: string]: any,
}

interface LambdaArchive {
    P: Identifier,
    E: ExprArchive,
    [key: string]: any,
}

interface ApplyArchive {
    L: ExprArchive,
    R: ExprArchive,
    [key: string]: any,
}
