import { Context } from '../Context'
import { ContextDumper } from '../ContextDumper';
import { ContextArchiveV2 } from '../Types/ContextArchiveV2';

export class ContextDumperV2 extends ContextDumper {
    public dump(context: Context): ContextArchiveV2 {
        const translated = context.entories.map(([label, callable]) => ({
            N: label,
            ...callable.dump(),
        }))

        return {
            version: '2.0',
            context: translated,
        }
    }
}
