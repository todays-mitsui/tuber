import { Expr, Identifier } from "./Expr";
import { Callable } from "./Callable";
import { ToJSON } from "../Interface/ToJSON";

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

export abstract class Command implements ToJSON {
    abstract toJSON(): Object
}

export class EvalCommand extends Command {
    public constructor(readonly expr: Expr) {
        super()
    }

    public map(callbackfn: (expr: Expr) => Expr) {
        return new EvalCommand(callbackfn(this.expr))
    }

    public toJSON() {
        return {
            action: Action.Eval,
            expr: this.expr.toJSON(),
        }
    }
}

export class EvalLastCommand extends Command {
    public constructor(readonly expr: Expr) {
        super()
    }

    public map(callbackfn: (expr: Expr) => Expr) {
        return new EvalLastCommand(callbackfn(this.expr))
    }

    public toJSON() {
        return {
            action: Action.EvalLast,
            expr: this.expr.toJSON(),
        }
    }
}

export class EvalHeadCommand extends Command {
    public constructor(readonly expr: Expr, readonly maxLength: number) {
        super()
    }

    public map(callbackfn: (expr: Expr) => Expr) {
        return new EvalHeadCommand(callbackfn(this.expr), this.maxLength)
    }

    public toJSON() {
        return {
            action: Action.EvalHead,
            expr: this.expr.toJSON(),
            maxLength: this.maxLength,
        }
    }
}

export class EvalTailCommand extends Command {
    public constructor(readonly expr: Expr, readonly maxLength: number) {
        super()
    }

    public map(callbackfn: (expr: Expr) => Expr) {
        return new EvalTailCommand(callbackfn(this.expr), this.maxLength)
    }

    public toJSON() {
        return {
            action: Action.EvalTail,
            expr: this.expr.toJSON(),
            maxLength: this.maxLength,
        }
    }
}

export class AddCommand extends Command {
    public constructor(readonly identifier: Identifier, readonly callable: Callable) {
        super()
    }

    public map(callbackfn: (callable: Callable) => Callable) {
        return new AddCommand(this.identifier, callbackfn(this.callable))
    }

    public toJSON() {
        return {
            action: Action.Add,
            identifier: this.identifier,
            callable: this.callable.toJSON(),
        }
    }
}

export class UpdateCommand extends Command {
    public constructor(readonly identifier: Identifier, readonly callable: Callable) {
        super()
    }

    public map(callbackfn: (callable: Callable) => Callable) {
        return new UpdateCommand(this.identifier, callbackfn(this.callable))
    }

    public toJSON() {
        return {
            action: Action.Update,
            identifier: this.identifier,
            callable: this.callable.toJSON(),
        }
    }
}

export class InfoCommand extends Command {
    public constructor(readonly identifier: Identifier) {
        super()
    }

    public toJSON() {
        return {
            action: Action.Info,
            identifier: this.identifier,
        }
    }
}

export class ContextCommand extends Command {
    public constructor() {
        super()
    }

    public toJSON() {
        return {
            action: Action.Context,
        }
    }
}
