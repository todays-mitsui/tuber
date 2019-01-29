import { Identifier, Expr } from "./Expr";
import { ToJSON } from "../Interface/ToJSON";

export class Callable implements ToJSON {
    public constructor(readonly params: Identifier[], readonly bareExpr: Expr) {
    }

    public toJSON() {
        return {
            params: this.params,
            bareExpr: this.bareExpr.toJSON(),
        }
    }
}
