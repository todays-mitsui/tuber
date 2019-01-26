import { Expr, Identifier } from "./Expr";

export type Action = 'Eval' | 'EvalLast' | 'EvalHead' | 'EvalTail' | 'Add' | 'Update' | 'Info' | 'Context'

export namespace Action {
    export const Eval    : Action = 'Eval'
    export const EvalLast: Action = 'EvalLast'
    export const EvalHead: Action = 'EvalHead'
    export const EvalTail: Action = 'EvalTail'
    export const Add     : Action = 'Add'
    export const Update  : Action = 'Update'
    export const Info    : Action = 'Info'
    export const Context : Action = 'Context'
}

export interface Command {
    action: Action,
    operand?: {
        identifier?: Identifier,
        expr?: Expr,
        length?: number,
    },
}

