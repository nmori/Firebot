import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "AND",
        usage: "AND[条件, 条件, ...]",
        description: 'すべての条件が成立する場合、 true を返します。$if[]内でのみ動作します。',
        examples: [
            {
                usage: 'AND[a === a, b === b]',
                description: "a が a に等しく、b が b に等しいとき、true を返します"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;