// Migration: done

"use strict";

const accountAccess = require("../../common/account-access");

const { OutputDataType } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "streamer",
        description: "Streamer アカウントのユーザー名を出力する。",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: () => {
        return accountAccess.getAccounts().streamer.username;
    }
};

module.exports = model;
