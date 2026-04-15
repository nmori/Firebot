import type { ReplaceVariable } from "../../../../types/variables";

import viewerMetadataManager from "../../../viewers/viewer-metadata-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "topMetadataUser",
        description: "メタデータランキングの特定順位のユーザー名または値を取得します。",
        examples: [
            {
                usage: "topMetadataUser[slaps, 1, username]",
                description: "スラップ数1位のユーザー名を取得します。"
            },
            {
                usage: "topMetadataUser[slaps, 5, amount]",
                description: "5位のユーザーのスラップ数を取得します。"
            }
        ],
        usage: "topMetadataUser[metadataKey, position, username/amount]",
        categories: ["user based", "advanced"],
        possibleDataOutput: ["text", "number"]
    },

    evaluator: async (_, metadataKey: string, position: number = 1, usernameOrPosition = "username") => {

        if (metadataKey == null) {
            return "[Invalid metadata name]";
        }

        const userAtPosition = await viewerMetadataManager.getTopMetadataPosition(metadataKey, position);

        if (userAtPosition == null) {
            return "[Can't find user at position]";
        }

        if (usernameOrPosition === "username") {
            return userAtPosition.displayName;
        }
        return userAtPosition.metadata[metadataKey];
    }
};

export default model;
