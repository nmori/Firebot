import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

import viewerMetadataManager from "../../../viewers/viewer-metadata-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "topMetadataUser",
        description: "トップメタデータリストの特定の位置のユーザー名または金額を取得する",
        examples: [
            {
                usage: "topMetadataUser[slaps, 1, username]",
                description: "トップ・スラッパーのユーザー名を取得"
            },
            {
                usage: "topMetadataUser[slaps, 5, amount]",
                description: "トップ5スラッパーのスラップ数を取得"
            }
        ],
        usage: "topMetadataUser[metadataKey, position, username/amount]",
        categories: [VariableCategory.USER, VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT, OutputDataType.NUMBER]
    },
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    evaluator: async (_, metadataKey: string, position: number = 1, usernameOrPosition = "username") => {

        if (metadataKey == null) {
            return "[無効なメタデータ名]";
        }

        const userAtPosition = await viewerMetadataManager.getTopMetadataPosition(metadataKey, position);

        if (userAtPosition == null) {
            return "[ユーザーが見つからない]";
        }

        if (usernameOrPosition === "username") {
            return userAtPosition.displayName;
        }
        return userAtPosition.metadata[metadataKey];
    }
};

export default model;
