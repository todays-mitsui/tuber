import { Identifier, ExprJSON } from "./Expr";

export interface ContextArchiveItem {
    name: Identifier
    params: Identifier[]
    bareExpr: ExprJSON
}

export interface ContextArchive {
    version: string
    context: ContextArchiveItem[]
}
