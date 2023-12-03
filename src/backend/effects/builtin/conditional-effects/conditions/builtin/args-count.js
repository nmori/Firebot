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
    comparisonTypes: ["is", "is not", "is less than", "is greater than"],
    leftSideValueType: "none",
    rightSideValueType: "number",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;

        const args = trigger.metadata.userCommand.args || [];

        const argsCount = args.length;

        switch (comparisonType) {
        case "is":
            return argsCount === rightSideValue;
        case "is not":
            return argsCount !== rightSideValue;
        case "is less than":
            return argsCount < rightSideValue;
        case "is greater than":
            return argsCount > rightSideValue;
        default:
            return false;
        }
    }
};