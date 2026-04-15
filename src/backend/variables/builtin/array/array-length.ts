import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "arrayLength",
        usage: "arrayLength[array]",
        description: "入力配列の長さを返します。",
        examples: [
            {
                usage: `arrayLength["[1,2,3]"]`,
                description: "3 を返します。"
            },
            {
                usage: "arrayLength[rawArray]",
                description: "生配列の長さを返します。"
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
                return 0;
            }
        }

        if (Array.isArray(subject)) {
            return subject.length;
        }
        return 0;
    }
};

export default model;