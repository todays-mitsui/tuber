import { Expr } from "./Types/Expr";
import { Location } from "./Location";
import { Stack } from "immutable";
import { Context } from "./Context";
import { ApplicationError } from "./Error/ApplicationError";


type Result = Just<Expr> | Try<Focus> | Fail

class Just<T> {
    constructor(public val: T) {}
}

class Try<T> {
    constructor(public vals: T[]) {}
}

class Fail {
}


export class Focus {
    constructor(private _current: Expr, private _location = Location.root()) {
    }

    get expr() {
        return this._location.reassemble(this._current)
    }

    get current() {
        return this._current
    }

    get location() {
        return this._location
    }

    public goLeft() {
        if (this.current.type !== 'Apply') {
            throw new ApplicationError('現在フォーカスしている節は関数適用ではありません')
        }

        return new Focus(
            this.current.left,
            this.location.goLeft(this.current.right)
        )
    }

    public goRight() {
        if (this.current.type !== 'Apply') {
            throw new ApplicationError('現在フォーカスしている節は関数適用ではありません')
        }

        return new Focus(
            this.current.right,
            this.location.goRight(this.current.left)
        )
    }

    private popRightTrees(n: number) {
        return this.location.popRightTrees(n)
    }

    private invoke(args) {
        if (this.current.type !== 'Lambda' && this.current.type !== 'Combinator') {
            throw new ApplicationError('現在フォーカスしている節は簡約可能ではありません')
        }

        this.current.betaRedex = true

        return undefined as Expr;
    }

    public reduce(context: Context) {
        let focus = this
        let tryStack = Stack()

        do {
            let result = Focus._reduce(context, focus)

            if (result instanceof Try) {
                tryStack = tryStack.push(...result.vals)
            } else if (result instanceof Just) {
                return new Focus(result.val);
            }

            focus = tryStack.first()
            tryStack = tryStack.shift()
        } while (!tryStack.isEmpty())

        return null
    }

    static _reduce(context: Context, focus: Focus): Result {
        switch (focus.current.type) {
            case 'Lambda': {
                try {
                    const [[arg], newLocation] = focus.popRightTrees(1)

                    return new Just(newLocation.reassemble(focus.invoke([arg])))
                } catch (e) {
                    return new Fail()
                }
            }

            case 'Apply': {
                return new Try([
                    focus.goLeft(),
                    focus.goRight(),
                ])
            }

            case 'Combinator': {
                const func = context.get(focus.current)

                if (!func) { return new Fail() }

                try {
                    const arity = func.arity
                    const [args, newLocation] = focus.popRightTrees(arity)

                    return new Just(newLocation.reassemble(focus.invoke(args)))
                  } catch (e) {
                    return new Fail()
                  }
            }

            default: {
                return new Fail()
            }
        }
    }
}
