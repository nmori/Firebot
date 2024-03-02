import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";
import { EffectTrigger } from "../../../../../shared/effect-constants";

import twitchApi from "../../../../twitch-api/api";
import roleHelpers from "../../../../roles/role-helpers";

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = true;
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.CUSTOM_SCRIPT] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "hasRole",
        usage: "hasRole[user, role]",
        description: "ユーザが指定したロールを持っている場合に true を返します。$if内でのみ有効です。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.ALL]
    },
    evaluator: async (trigger, username: string, role: string) => {
        if (username == null || username === "") {
            return false;
        }

        if (role == null || role === "") {
            return false;
        }

        try {
            const user = await twitchApi.users.getUserByName(username);
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