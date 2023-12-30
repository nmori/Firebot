// Migration: info - Needs implementation details

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const userDatabase = require("../../database/userDatabase");

const model = {
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
    evaluator: async (_, metadataKey, position = 1, usernameOrPosition = "username") => {

        if (metadataKey == null) {
            return "[無効なメタデータ名]";
        }

        const userAtPosition = await userDatabase.getTopMetadataPosition(metadataKey, position);

        if (userAtPosition == null) {
            return "[ユーザーが見つからない]";
        }

        if (usernameOrPosition === "username") {
            return userAtPosition.displayName;
        }
        return userAtPosition.metadata[metadataKey];
    }
};

module.exports = model;
