import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NANY",
        usage: "NANY[条件, 条件, ...]",
        description: 'すべての条件が不成立である場合に True を返す。',
        examples: [
            {
                usage: 'NANY[a === b, b === c]',
                description: "a が be と等しくなく、b が c と等しくない場合に True を返す。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;