import { Identifier, Expr } from "./Expr";

export interface Callable {
    params: Identifier[],
    bareExpr: Expr,
}
