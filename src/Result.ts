import { Expr } from "./Types/Expr";
import { Route } from "./Route";

export type Result = Just<Expr> | Try<[Expr, Route][]> | Fail

export class Just<T> {
    constructor(readonly val: T) {}
}

export class Try<T> {
    constructor(readonly val: T) {}
}

export class Fail {
}
