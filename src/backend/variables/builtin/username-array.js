// Migration: info needed

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "usernameArray",
        description: "ユーザ DB に保存されているすべてのユーザ名を JSON 配列で返します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async () => {
        const userDb = require("../../database/userDatabase");
        const usernames = await userDb.getAllUsernames();
        return JSON.stringify(usernames);
    }
};

module.exports = model;
