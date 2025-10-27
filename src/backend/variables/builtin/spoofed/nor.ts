import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NOR",
        usage: "NOR[条件, 条件, ...]",
        description: 'すべての条件が不成立であった場合に True を返す。',
        examples: [
            {
                usage: 'NOR[a === b, b === c]',
                description: "a が be と等しくなく、b が c と等しくない場合に True を返す。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;