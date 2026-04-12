"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

function isObjectOrArray(data) {
    return Array.isArray(data) || (typeof data === 'object' && !(data instanceof String));
}

const model = {
    definition: {
        handle: "userMetadata",
<<<<<<< HEAD:src/backend/variables/builtin/user-metadata.js
=======
        description: "ユーザーに関連付けられているメタデータを取得します。",
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/user/user-metadata.ts
        usage: "userMetadata[username, metadataKey]",
        examples: [
            {
                usage: "userMetadata[username, metadataKey, defaultValue]",
                description: "ユーザーにデフォルト値が存在しない場合は、デフォルト値を指定します。"
            },
            {
                usage: "userMetadata[username, metadataKey, null, propertyPath]",
                description: "第2引数にプロパティパス（ドット記法）または配列インデックスを指定する。"
            }
        ],
<<<<<<< HEAD:src/backend/variables/builtin/user-metadata.js
        description: "ユーザーに関連付けられているメタデータを取得します。",
=======
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/user/user-metadata.ts
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: async (_, username, key, defaultValue = null, propertyPath = null) => {
        const userDb = require("../../database/userDatabase");
        const data = await userDb.getUserMetadata(username, key, propertyPath);
        if (data == null) {
            return defaultValue;
        }

        if (isObjectOrArray(data)) {
            return JSON.stringify(data);
        }

        return data;
    }
};


module.exports = model;
