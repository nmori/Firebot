import type { ReplaceVariable } from "../../../../types/variables";

import usernameArray from './username-array';

const model : ReplaceVariable = {
    definition: {
        handle: "rawUsernameArray",
        description: "(非推奨: $usernameArray を使用してください) ユーザーDBに保存されているすべてのユーザー名の生配列を返します。",
        categories: ["advanced"],
        possibleDataOutput: ["array"],
        hidden: true
    },
    evaluator: usernameArray.evaluator
};

export default model;