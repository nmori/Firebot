import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "arrayRandomItem",
        usage: "arrayRandomItem[array]",
        description: "指定した配列からランダムな要素を返します。",
        examples: [
            {
                usage: `arrayRandomItem["[1,2,3]"]`,
                description: "[1,2,3] からランダムな要素を返します。"
            },
            {
                usage: "arrayRandomItem[rawArray]",
                description: "生配列からランダムな要素を返します。"
            }
        ],
        categories: ["advanced", "numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (
        trigger: Trigger,
        subject: string | unknown
    ) : number => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch (ignore) {
                return null;
            }
        }

        if (Array.isArray(subject) && subject.length) {
            return subject[Math.floor(Math.random() * subject.length)];
        }
        return null;
    }
};

export default model;