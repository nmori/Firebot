import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NAND",
        usage: "NAND[condition, condition, ...]",
        description: 'いずれかの条件が false の場合に true を返します。',
        examples: [
            {
                usage: 'NAND[a === a, b === c]',
                description: "b が c と等しくないため true を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;