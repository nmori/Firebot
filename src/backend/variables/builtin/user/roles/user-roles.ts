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
        handle: "userRoles",
        usage: "userRoles[username, all|firebot|custom|twitch|team]",
        description: "ユーザのすべての役割を返します。",
        examples: [
            {
                usage: "userRoles",
                description: "ユーザのすべての役割を返します。"
            },
            {
                usage: "userRoles[$user]",
                description: "指定されたユーザのすべての役割を返します。"
            },
            {
                usage: "userRoles[$user, all]",
                description: "指定されたユーザのすべての役割を返します。"
            },
            {
                usage: "userRoles[$user, firebot]",
                description: "指定されたユーザのすべてのfirebot役割を返します。"
            },
            {
                usage: "userRoles[$user, custom]",
                description: "指定されたユーザのすべてのカスタム役割を返します。"
            },
            {
                usage: "userRoles[$user, twitch]",
                description: "指定したユーザーのすべてのTwitch役割を返します。"
            },
            {
                usage: "userRoles[$user, team]",
                description: "指定したユーザーのすべてのTwitchチームの役割を返します。"
            }
        ],
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.ALL]
    },
    evaluator: async (trigger, username: null | string, roleType) : Promise<unknown[]> => {
        if (username == null && roleType == null) {
            username = trigger.metadata.username;
            roleType = "all";
        }

        if (username == null || username === "") {
            return [];
        }

        if (roleType == null || roleType === "") {
            roleType = "all";
        } else {
            roleType = (`${roleType}`).toLowerCase();
        }

        try {
            const user = await twitchApi.users.getUserByName(username);
            if (user == null) {
                return [];
            }
    
            const userRoles = await roleHelpers.getAllRolesForViewerNameSpaced(user.id);
    
            Object
                .keys(userRoles)
                .forEach((key: string) => {
                    userRoles[key] = userRoles[key].map(r => r.name);
                });
    
            if (roleType === "all") {
                return [
                    userRoles.twitchRoles || [],
                    userRoles.teamRoles || [],
                    userRoles.firebotRoles || [],
                    userRoles.customRoles || []
                ];
            }
            if (roleType === "twitch") {
                return userRoles.twitchRoles;
            }
            if (roleType === "team") {
                return userRoles.teamRoles;
            }
            if (roleType === "firebot") {
                return userRoles.firebotRoles;
            }
            if (roleType === "custom") {
                return userRoles.customRoles;
            }
        } catch {
            // Silently fail
        }

        return [];
    }
};

export default model;