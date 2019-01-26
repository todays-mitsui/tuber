import { Expr } from "./Expr";
import { Command } from "./Command";

export interface Parser {
    style: string,
    parseExpr: (src: string) => Expr,
    parseCommand: (src: string) => Command,
}
