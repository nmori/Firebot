"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:community-subs-gifted"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "giftReceivers",
        description: "コミュニティサブスクギフトの受取人名をカンマ区切りにしたリスト。",
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
    evaluator: (trigger, target = null, property) => {
        if (trigger == null || trigger.metadata == null || trigger.metadata.eventData == null || trigger.metadata.eventData.giftReceivers == null) {
            return "ギフトの受取人情報の取得に失敗しました";
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
            return "最初の引数は数字でなければならない。";
        }

        if (target != null && property == null) {
            return "無効な引数の数";
        }

        if (target != null && property != null) {
            return "第2引数には'username'または'months'のいずれかを指定する必要がある。";
        }

        return "変数の無効な使用";
    }
};

module.exports = model;
