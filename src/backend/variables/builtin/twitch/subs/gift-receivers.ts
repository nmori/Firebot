import { ReplaceVariable } from "../../../../../types/variables";
import { EffectTrigger } from "../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:community-subs-gifted"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "giftReceivers",
        description: "コミュニティ・ギフトの受取人のユーザー名をカンマ区切りにしたリスト。",
        examples: [
            {
                usage: "giftReceivers[1, username]",
                description: "リスト内の特定のギフト受取人のユーザー名を表示します。"
            },
            {
                usage: "giftReceivers[3, months]",
                description: "リスト内の特定のギフト受取人の累計サブスク月数を表示します。"
            }
        ],
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.USER, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.ALL]
    },
    evaluator: (trigger, target: null | number = null, property) => {
        if (trigger == null || trigger.metadata == null || trigger.metadata.eventData == null || trigger.metadata.eventData.giftReceivers == null) {
            return "Failed to get gift receiver info";
        }

        const giftReceiverNames = trigger.metadata.eventData.giftReceivers.map(gr => gr.gifteeUsername);
        const giftReceiverMonths = trigger.metadata.eventData.giftReceivers.map(gr => gr.giftSubMonths);

        if (target == null && property == null) {
            return giftReceiverNames.join(", ");
        }

        if (target != null && property === "username") {
            return `${giftReceiverNames[target]}`;
        }

        if (target != null && property === "months") {
            return `${giftReceiverMonths[target]}`;
        }

        if (isNaN(target) && property != null) {
            return "The first argument needs to be a number";
        }

        if (target != null && property == null) {
            return "Invalid number of arguments";
        }

        if (target != null && property != null) {
            return "The second argument needs to be either 'username' or 'months'";
        }

        return "Invalid use of variable";
    }
};

export default model;