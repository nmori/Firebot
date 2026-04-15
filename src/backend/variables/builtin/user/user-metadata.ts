import type { ReplaceVariable } from "../../../../types/variables";

import viewerMetadataManager from "../../../viewers/viewer-metadata-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "userMetadata",
        description: "ユーザーに関連するメタデータを取得します。",
        usage: "userMetadata[username, metadataKey]",
        examples: [
            {
                usage: "userMetadata[username, metadataKey, defaultValue]",
                description: "ユーザーに値がない場偂のデフォルト値を指定します。"
            },
            {
                usage: "userMetadata[username, metadataKey, null, propertyPath]",
                description: "ドット表記のプロパティパスまたは配列インデックスで値を取得します。"
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
