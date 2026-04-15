import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "NOT",
        usage: "NOT[condition]",
        description: '条件の結果の逆を返します。$if[] 内でのみ機能します。',
        examples: [
            {
                usage: 'NOT[1 === 1]',
                description: "条件が true であるため false を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["bool"],
        spoof: true
    }
};

export default model;