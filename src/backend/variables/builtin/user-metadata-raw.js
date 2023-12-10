"use strict";
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawUserMetadata",
        usage: "rawUserMetadata[username, metadataKey]",
        examples: [
            {
                usage: "rawUserMetadata[username, metadataKey, defaultValue]",
                description: "ユーザーにデフォルト値が存在しない場合、デフォルト値を提供する。."
            },
            {
                usage: "rawUserMetadata[username, metadataKey, null, propertyPath]",
                description: "第2引数として、プロパティパス（ドット記法を使用）または配列インデックスを指定します。."
            }
        ],
        description: "ユーザーに関連付けられている生のメタデータを取得する。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: async (_, username, key, defaultValue = null, propertyPath = null) => {
        const userDb = require("../../database/userDatabase");
        const data = await userDb.getUserMetadata(username, key, propertyPath);
        if (data == null) {
            return defaultValue;
        }
        return data;
    }
};


module.exports = model;
