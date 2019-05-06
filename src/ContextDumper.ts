import { Context } from "./Context";
import { ContextArchive } from "./Types/ContextArchive";
import { ContextArchiveV2 } from "./Types/ContextArchiveV2";

export abstract class ContextDumper {
    abstract dump(context: Context): ContextArchive|ContextArchiveV2
}
