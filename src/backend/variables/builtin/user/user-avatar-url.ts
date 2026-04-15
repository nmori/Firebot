import type { ReplaceVariable } from "../../../../types/variables";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

const model : ReplaceVariable = {
    definition: {
        handle: "userAvatarUrl",
        aliases: ["userProfileImageUrl"],
        usage: "userAvatarUrl",
        description: "トリガーに関連するユーザーのアバター URL を取得します。",
        examples: [
            {
                usage: "userAvatarUrl[$target]",
                description: "コマンド内でターゲットユーザーのアバター URL を取得します。"
            },
            {
                usage: "userAvatarUrl[ebiggz]",
                description: "指定したユーザーのアバター URL を取得します。"
            }
        ],
        categories: ["user based"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null) {
            username = trigger.metadata.username;
        }

        try {
            const userInfo = await TwitchApi.users.getUserByName(username);
            return userInfo.profilePictureUrl ? userInfo.profilePictureUrl : "[No Avatar Found]";
        } catch {
            return "[No Avatar Found]";
        }
    }
};

export default model;