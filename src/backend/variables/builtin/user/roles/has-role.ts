import type { ReplaceVariable, TriggersObject } from "../../../../../types/variables";

import { TwitchApi } from "../../../../streaming-platforms/twitch/api";
import roleHelpers from "../../../../roles/role-helpers";

const triggers: TriggersObject = {};
triggers["command"] = true;
triggers["event"] = true;
triggers["manual"] = true;
triggers["custom_script"] = true;
triggers["preset"] = true;
triggers["channel_reward"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "hasRole",
        usage: "hasRole[user, role]",
        description: "ユーザーが指定したロールを保持している場合は true を返します。`$if` 内でのみ有効です。",
        examples: [
            {
                usage: "hasRole[user, Moderator]",
                description: "ユーザーがモデレーターの場偂は true を返します。"
            },
            {
                usage: "hasRole[user, VIP]",
                description: "ユーザーが VIP の場偂は true を返します。"
            }
        ],
        triggers: triggers,
        categories: ["common", "user based"],
        possibleDataOutput: ["ALL"]
    },
    evaluator: async (_trigger, username: string, role: string) => {
        if (username == null || username === "") {
            return false;
        }

        if (role == null || role === "") {
            return false;
        }

        try {
            const user = await TwitchApi.users.getUserByName(username);
            if (user == null) {
                return false;
            }

            return await roleHelpers.viewerHasRoleByName(user.id, role);
        } catch {
            // Silently fail
        }

        return false;
    }
};
export default model;
