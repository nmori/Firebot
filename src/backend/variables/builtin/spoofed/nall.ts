import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NALL",
        usage: "NALL[条件, 条件, ...]",
        description: 'いずれかの条件が不成立である場合に True を返す。',
        examples: [
            {
                usage: 'NALL[a === a, b === c]',
                description: "b が c に等しくないときにTrue を返す"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;