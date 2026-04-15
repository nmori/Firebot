import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NOR",
        usage: "NOR[condition, condition, ...]",
        description: 'すべての条件が false の場合に true を返します。',
        examples: [
            {
                usage: 'NOR[a === b, b === c]',
                description: "a が b と等しくなく b も c と等しくないため true を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;