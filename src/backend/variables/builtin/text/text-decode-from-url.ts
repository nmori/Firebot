import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "decodeFromUrl",
        description: "URL エンコードされた文字列をデコードします。",
        usage: "decodeFromUrl[text]",
        examples: [
            {
                usage: `decodeFromUrl["Hello%20World%21"]`,
                description: `"Hello World!" を返します。`
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
        return decodeURIComponent(stringify(subject));
    }
};

export default model;
