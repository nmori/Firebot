import type { ReplaceVariable } from "../../../../types/variables";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

const model : ReplaceVariable = {
    definition: {
        handle: "userBio",
        aliases: ["userAbout", "userDescription"],
        usage: "userBio",
        description: "トリガーに関連するユーザーのプロフィール诳明を取得します。",
        examples: [
            {
                usage: "userBio[$target]",
                description: "コマンド内でターゲットユーザーのプロフィール诳明を取得します。"
            },
            {
                usage: "userBio[ebiggz]",
                description: "指定したユーザーのプロフィール诳明を取得します。"
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
            return userInfo.description ? userInfo.description : "[No Description Found]";
        } catch {
            return "[No Description Found]";
        }
    }
};

export default model;