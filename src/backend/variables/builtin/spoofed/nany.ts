import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NANY",
        usage: "NANY[condition, condition, ...]",
        description: 'すべての条件が false の場合に true を返します。',
        examples: [
            {
                usage: 'NANY[a === b, b === c]',
                description: "a が b と等しくなく b も c と等しくないため true を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;