import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "ANY",
        usage: "ANY[condition, condition, ...]",
        description: 'いずれかの条件が true の場合に true を返します。$if[] 内でのみ機能します。',
        examples: [
            {
                usage: 'ANY[a === b, c === c]',
                description: "c が c に等しいため true を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;