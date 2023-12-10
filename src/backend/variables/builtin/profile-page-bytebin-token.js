"use strict";

const cloudSync = require("../../cloud-sync/profile-sync");
const { OutputDataType } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "profilePageBytebinToken",
        description: "配信者プロファイルのBytebinIDを取得する。jsonを取得には https://bytebin.lucko.me/[ID] へアクセス。",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, page = "commands") => {
        return await cloudSync.syncProfileData({
            username: trigger.metadata.username,
            userRoles: [],
            profilePage: page
        });
    }
};

module.exports = model;
