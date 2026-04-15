import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "$name",
        usage: "$name[...path?]",
        description: 'カスタム変数の値を取得します。パスを指定するとその値を辿って返します。',
        examples: [
            {
                usage: '$example',
                description: "カスタム変数 'example' の値を返します（$customVariable[example] と同義）。"
            },
            {
                usage: '$example[path, to, value]',
                description: "カスタム変数 'example' の指定パスの値を返します（$customVariable[example, path.to.value] と同義）。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["ALL"],
        spoof: true
    }
};

export default model;