import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

const cloudSync = require("../../../cloud-sync/profile-sync");

const model : ReplaceVariable = {
    definition: {
        handle: "profilePageBytebinToken",
        description: "ストリーマープロファイルのBytebin IDを取得する。https://bytebin.lucko.me/ID-HERE。",
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

export default model;