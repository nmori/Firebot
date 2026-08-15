import type { ReplaceVariable } from "../../../../types/variables";
import * as cloudSync from "../../../cloud-sync";

const model : ReplaceVariable = {
    definition: {
        handle: "profilePageBytebinToken",
        description: "配信者プロフィールの bytebin ID を取得します。https://bytebin.lucko.me/ID-HERE にアクセスすると JSON を参照できます。",
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