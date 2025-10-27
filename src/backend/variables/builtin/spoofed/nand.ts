import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NAND",
        usage: "NAND[条件, 条件, ...]",
        description: 'いずれかの条件が不成立の場合にTrueを返す。',
        examples: [
            {
                usage: 'NAND[a === a, b === c]',
                description: "b が c に等しくないとき、True を返す"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;