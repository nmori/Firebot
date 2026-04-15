import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "concat",
        description: "文字列を結合します。",
        usage: "concat[text, text, ...]",
        examples: [
            {
                usage: `concat[Hello, " ", World]`,
                description: `"Hello World" を返します。`
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        ...args: unknown[]
    ) : string => {
        return args.map(stringify).join('');
    }
};

export default model;