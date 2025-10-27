import type { ReplaceVariable } from "../../../../types/variables";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

const model : ReplaceVariable = {
    definition: {
        handle: "userAvatarUrl",
        aliases: ["userProfileImageUrl"],
        usage: "userAvatarUrl",
        description: "関連するユーザー（コマンドを実行したユーザー、ボタンを押したユーザーなど）のアバターのURLを取得します。",
        examples: [
            {
                usage: "userAvatarUrl[$target]",
                description: "コマンドの中で、ターゲットユーザーのアバターのURLを取得します。"
            },
            {
                usage: "userAvatarUrl[ebiggz]",
                description: "特定のユーザーのアバターのURLを取得します。"
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