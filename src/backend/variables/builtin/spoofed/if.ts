import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "if",
        usage: "if[condition, when_true, when_false]",
        description: '条件の結果に基づいてパラメータを返します。',
        examples: [
            {
                usage: 'if[$user === Jim, JIM]',
                description: "ユーザーが Jim の場合は JIM を返し、そうでない場合は空文字を返します。"
            },
            {
                usage: 'if[$user === Jim, JIM, JOHN]',
                description: "ユーザーが Jim の場合は JIM を、そうでない場合は JOHN を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["ALL"],
        spoof: true
    }
};

export default model;