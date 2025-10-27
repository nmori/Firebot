import type { ReplaceVariable } from "../../../../types/variables";

import viewerMetadataManager from "../../../viewers/viewer-metadata-manager";

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
        categories: ["advanced"],
        possibleDataOutput: ["number", "text"]
    },

    evaluator: async (_, username: string, key: string, defaultValue = null, propertyPath: string = null) => {
        const data = await viewerMetadataManager.getViewerMetadata(username, key, propertyPath);

        if (data == null) {
            return defaultValue;
        }

        return data;
    }
};


export default model;
