import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const userDb = require("../../../database/userDatabase");

const model : ReplaceVariable = {
    definition: {
        handle: "userMetadata",
        description: "ユーザーに関連付けられているメタデータを取得します。",
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
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: async (trigger, username, key, defaultValue = null, propertyPath = null) => {
        const data = await userDb.getUserMetadata(username, key, propertyPath);

        if (data == null) {
            return defaultValue;
        }

        return data;
    }
};


export default model;
