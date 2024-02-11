"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

function isObjectOrArray(data) {
    return Array.isArray(data) || (typeof data === 'object' && !(data instanceof String));
}

const model = {
    definition: {
        handle: "userLastseen",
        usage: "userLastseen[username]",
        examples: [
            {
                usage: "userLastseen[username]",
                description: "ユーザーにデフォルト値が存在しない場合は、デフォルト値を指定します。"
            }
        ],
        description: "ユーザの最終閲覧日時を取得します。",
        categories: [VariableCategory.JP],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: async(trigger, username) => {
        const userDb = require("../../database/userDatabase");
        if (username == null) {
            username = trigger.metadata.username;
        }
        const data = await userDb.getUserByUsername(username);
        if (data == null) {
            return 0;
        }
        return data.lastSeen;
    }
};


module.exports = model;
