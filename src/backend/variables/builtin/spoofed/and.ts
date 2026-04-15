import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "AND",
        usage: "AND[condition, condition, ...]",
        description: 'すべての条件が true の場合に true を返します。$if[] 内でのみ機能します。',
        examples: [
            {
                usage: 'AND[a === a, b === b]',
                description: "a が a に等しく b が b に等しいため true を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;