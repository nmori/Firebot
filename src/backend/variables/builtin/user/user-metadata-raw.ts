import type { ReplaceVariable } from "../../../../types/variables";

import userMetadata from './user-metadata';

const model : ReplaceVariable = {
    definition: {
        handle: "rawUserMetadata",
        description: "(非推奨: $userMetaData を使用してください) ユーザーに紐づく生のメタデータを取得します。",
        usage: "rawUserMetadata[username, metadataKey]",
        examples: [
            {
                usage: "rawUserMetadata[username, metadataKey, defaultValue]",
                description: "ユーザーに値が存在しない場合の既定値を指定します。"
            },
            {
                usage: "rawUserMetadata[username, metadataKey, null, propertyPath]",
                description: "第 2 引数にプロパティのパス (ドット記法) または配列のインデックスを指定します。"
            }
        ],

        categories: ["advanced"],
        possibleDataOutput: ["number", "text"],
        hidden: true
    },
    evaluator: userMetadata.evaluator
};

export default model;
