import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "capitalize",
        description: "先頭文字を大文字にし、残りを小文字に変換します。",
        usage: "capitalize[text]",
        examples: [
            {
                usage: `capitalize["hello world"]`,
                description: `"Hello world" を返します。`
            },
            {
                usage: `capitalize["HELLO WORLD"]`,
                description: `"Hello world" を返します。`
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: unknown
    ) : string => {
        if (typeof subject === 'string' || subject instanceof String) {
            const text = `${subject}`;

            if (text.length === 1) {
                return text.toUpperCase();
            }
            if (text.length > 1) {
                return `${text[0].toUpperCase()}${text.slice(1).toLowerCase()}`;
            }
        }
        return '';
    }
};

export default model;