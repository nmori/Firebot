// Migration: info needed

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "userExists",
        usage: "userExists[username]",
        description: "Firebotのデータベースにユーザーが存在する場合は'true'を、存在しない場合は'false'を出力します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, username) => {
        const userDb = require("../../database/userDatabase");
        const user = await userDb.getTwitchUserByUsername(username);
        return user != null;
    }
};

module.exports = model;
