import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "arrayJoin",
        description: "指定した区切り文字で配列の各要素を連結した文字列を返します。",
        usage: "arrayJoin[array, separator]",
        examples: [
            {
                usage: `arrayJoin["[1,2,3]", ", "]`,
                description: `"1, 2, 3" を返します。`
            },
            {
                usage: `arrayJoin["["apple","banana","cherry"]", " - "]`,
                description: `"apple - banana - cherry" を返します。`
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },

    evaluator: (
        trigger: Trigger,
        subject: string | unknown[],

        separator : string = ","
    ) : string => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch (ignore) {
                return '';
            }
        }
        if (Array.isArray(subject)) {
            return subject.join(separator);
        }
        return "";
    }
};

export default model;