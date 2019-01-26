import { Identifier, Expr } from "./Expr";

export interface Func {
    params: Identifier[],
    bareExpr: Expr,
}
