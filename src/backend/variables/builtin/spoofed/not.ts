import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NOT",
        usage: "NOT[条件]",
        description: '条件と逆の結果を返す。$if[]内でのみ動作する。',
        examples: [
            {
                usage: 'NOT[1 === 1]',
                description: "条件が成立しているので False を返す"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;