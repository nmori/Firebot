import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "arrayReverse",
        description: "逆順にした新しい配列を返します。",
        usage: "arrayReverse[array]",
        examples: [
            {
                usage: `arrayReverse["[1,2,3]"]`,
                description: "[3,2,1] を返します。"
            },
            {
                usage: "arrayReverse[rawArray]",
                description: "生配列を逆順にして返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: string | unknown[]
    ) : unknown[] => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch (ignore) {
                return [];
            }
        }
        if (!Array.isArray(subject)) {
            return [];
        }
        return [...subject].reverse();
    }
};

export default model;