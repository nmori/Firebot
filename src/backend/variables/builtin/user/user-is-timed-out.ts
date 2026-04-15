import type { ReplaceVariable } from "../../../../types/variables";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

const UserIsTimedOutVariable: ReplaceVariable = {
    definition: {
        handle: "userIsTimedOut",
        usage: "userIsTimedOut[username]",
        description: "指定したユーザーが現在タイムアウト中の場合は `true` を、そうでない場偂は `false` を返します。",
        categories: ["common", "user based"],
        possibleDataOutput: ["text", "bool"]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null || username === "") {
            return false;
        }

        const user = await TwitchApi.users.getUserByName(username);
        if (user == null) {
            return false;
        }

        return (await TwitchApi.moderation.isUserTimedOut(user.id)) ?? false;
    }
};

export default UserIsTimedOutVariable;