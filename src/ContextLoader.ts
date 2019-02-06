import { Context } from "./Context";

export abstract class ContextLoader {
    abstract load(): Context
}
