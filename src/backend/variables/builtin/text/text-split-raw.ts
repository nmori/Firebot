import type { ReplaceVariable } from "../../../../types/variables";

import textSplit from "./text-split";

const model : ReplaceVariable = {
    definition: {
        handle: "rawSplitText",
        description: "(非推奨: $splitText を使用してください) 指定した区切り文字でテキストを分割し、配列を返します。カスタム変数で便利です。",
        usage: "rawSplitText[text, separator]",
        categories: ["text"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: textSplit.evaluator
};

export default model;
