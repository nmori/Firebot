import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "if",
        usage: "if[条件, 成立時, 不成立時]",
        description: '条件の評価結果で結果を切りかえます。',
        examples: [
            {
                usage: 'if[$user === Jim, JIM]',
                description: "ユーザーがJimであればJIMを返し、そうでなければ空文字列を返す。"
            },
            {
                usage: 'if[$user === Jim, JIM, JOHN]',
                description: "ユーザーがJimの場合はJIMを返し、そうでない場合はJOHNを返す。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["ALL"],
        spoof: true
    }
};

export default model;