import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "arrayFrom",
        usage: "arrayFrom[value, value, ...]",
        description: "列挙した値を含む生配列を返します。",
        examples: [
            {
                usage: "arrayFrom[1, 2, 3]",
                description: "[1, 2, 3] を返します。"
            },
            {
                usage: `arrayFrom["a", "b", "c"]`,
                description: `["a", "b", "c"] を返します。`
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger, ...values: unknown[]) : unknown[] => values
};

export default model;