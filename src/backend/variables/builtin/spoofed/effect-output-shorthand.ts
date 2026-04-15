import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "&name",
        usage: "&name[...path?]",
        description: "エフェクト出力の値を取得します。パスを指定するとその値を辿って返します。",
        examples: [
            {
                usage: '&example',
                description: "エフェクト出力 'example' の値を返します（$effectOutput[example] と同義）。"
            },
            {
                usage: '&example[path, to, value]',
                description: "エフェクト出力 'example' の指定パスの値を返します（$effectOutput[example, path.to.value] と同義）。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["ALL"],
        spoof: true
    }
};

export default model;