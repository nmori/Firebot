// Migration: done

"use strict";

const accountAccess = require("../../common/account-access");
const { OutputDataType } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "bot",
        description: "Botアカウントのユーザー名を出力します。.",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: () => {
        if (accountAccess.getAccounts().bot.loggedIn) {
            return accountAccess.getAccounts().bot.username;
        }
        return "不明なBot";
    }
};

module.exports = model;
