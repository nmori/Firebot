import type { ReplaceVariable } from "../../../../types/variables";

import regexMatches from './regex-matches';

const model : ReplaceVariable = {
    evaluator: regexMatches.evaluator,
    definition: {
        handle: "rawRegexMatches",
        description: "(非推奨: $regexMatches を使用してください) 正規表現で文字列を絞り込み、一致したすべての結果を生配列で返します。",
        usage: "rawRegexMatches[string, expression]",
        examples: [
            {
                usage: "rawRegexMatches[string, expression, flags]",
                description: "正規表現の評価にフラグを追加します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    }
};

export default model;