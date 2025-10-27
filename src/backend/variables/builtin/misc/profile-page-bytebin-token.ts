import type { ReplaceVariable } from "../../../../types/variables";
import * as cloudSync from "../../../cloud-sync";

const model : ReplaceVariable = {
    definition: {
        handle: "profilePageBytebinToken",
        description: "ストリーマープロファイルのBytebin IDを取得する。https://bytebin.lucko.me/ID-HERE。",
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: async (trigger, page: "commands" | "quotes" = "commands") => {
        return await cloudSync.syncProfileData({
            username: trigger.metadata.username,
            userRoles: [],
            profilePage: page
        });
    }
};

export default model;