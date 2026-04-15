import type { ReplaceVariable } from "../../../../types/variables";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

const model : ReplaceVariable = {
    definition: {
        handle: "isUserInChat",
        usage: "isUserInChat[username]",
        description: "ユーザーが Twitch チャットに接続中の場合は `true` 、そうでない場合は `false` を返します。",
        categories: ["advanced"],
        possibleDataOutput: ["bool"]
    },
    evaluator: async (_, username: string) => {
        if (!username?.length) {
            return false;
        }

        username = username.toLowerCase();
        const chatters = await TwitchApi.chat.getAllChatters();

        return chatters?.some(c => c.userName === username || c.userDisplayName.toLowerCase() === username) ?? false;
    }
};

export default model;
