import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

import userMetadata from './user-metadata';

const model : ReplaceVariable = {
    definition: {
        handle: "rawUserMetadata",
        description: "(Deprecated: use $userMetaData) Get the raw metadata associated with the user.",
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
        description: "ユーザーに関連付けられている生のメタデータを取得する。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT],
        hidden: true
    },
    evaluator: userMetadata.evaluator
};

export default model;
