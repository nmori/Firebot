import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "#name",
        usage: "#name",
        description: '指定した名前のプリセットリスト引数の値を取得します。',
        examples: [
            {
                usage: '#example',
                description: "プリセットリスト引数 'example' の値を返します（$presetListArgs[example] と同義）。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["ALL"],
        spoof: true
    }
};

export default model;