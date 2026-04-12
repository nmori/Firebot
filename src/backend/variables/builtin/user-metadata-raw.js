"use strict";
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawUserMetadata",
<<<<<<< HEAD:src/backend/variables/builtin/user-metadata-raw.js
=======
        description: "ユーザーに関連付けられている生のメタデータを取得する。(廃止: $userMetaDataを使ってください)",
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/user/user-metadata-raw.ts
        usage: "rawUserMetadata[username, metadataKey]",
        examples: [
            {
                usage: "rawUserMetadata[username, metadataKey, defaultValue]",
                description: "ユーザーにデフォルト値が存在しない場合は、デフォルト値を指定します。"
            },
            {
                usage: "rawUserMetadata[username, metadataKey, null, propertyPath]",
                description: "第2引数にプロパティパス（ドット記法）または配列インデックスを指定する。"
            }
        ],
<<<<<<< HEAD:src/backend/variables/builtin/user-metadata-raw.js
        description: "ユーザーに関連付けられている生のメタデータを取得する。",
=======
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/user/user-metadata-raw.ts
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
