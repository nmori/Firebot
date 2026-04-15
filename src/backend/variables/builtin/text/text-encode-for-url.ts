import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "encodeForUrl",
        description: "URL 内で使用できるように文字列を URL エンコードします。",
        usage: "encodeForUrl[text]",
        examples: [
            {
                usage: "encodeForUrl[Hello World!]",
                description: `"Hello%20World%21" を返します。`
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: unknown
    ) : string => {
        if (subject == null) {
            return '';
        }
        return encodeURIComponent(stringify(subject));
    }
};

export default model;
