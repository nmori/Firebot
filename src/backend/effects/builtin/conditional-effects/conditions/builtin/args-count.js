"use strict";

const {
    EffectTrigger
} = require("../../../../../../shared/effect-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.MANUAL] = true;

module.exports = {
    id: "firebot:command-args-count",
    name: "コマンド引数カウント",
    description: "コマンドの引数の数に基づく条件",
    triggers: triggers,
    comparisonTypes: ["一致", "不一致", "未満", "より上"],
    leftSideValueType: "none",
    rightSideValueType: "number",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;

        const args = trigger.metadata.userCommand.args || [];

        const argsCount = args.length;

        switch (comparisonType) {
        case "is":
        case "一致":
            return argsCount === rightSideValue;
        case "is not":
        case "不一致":
            return argsCount !== rightSideValue;
        case "is less than":
        case "未満":
            return argsCount < rightSideValue;
        case "is greater than":
        case "より上":
            return argsCount > rightSideValue;
        default:
            return false;
        }
    }
};