import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "ceil",
        description: "指定した数値を最も近い整数に切り上げます。",
        usage: "ceil[num]",
        examples: [
            {
                usage: "ceil[3.2]",
                description: "4 を返します"
            }
        ],
        categories: ["numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (
        trigger: Trigger,
        subject: number | string
    ) : number => {
        subject = Number(subject);
        if (!Number.isFinite(subject)) {
            return 0;
        }
        return Math.ceil(subject);
    }
};

export default model;
