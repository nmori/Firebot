"use strict";

const {
    EffectTrigger
} = require("../../../../../../shared/effect-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.MANUAL] = true;

function normalizeArgsCountComparisonType(comparisonType) {
    const isAliases = new Set(["等しい", "is"]);
    const isNotAliases = new Set(["等しくない", "is not"]);
    const lessThanAliases = new Set(["より小さい", "is less than"]);
    const greaterThanAliases = new Set(["より大きい", "is greater than"]);

    if (isAliases.has(comparisonType)) {
        return "is";
    }

    if (isNotAliases.has(comparisonType)) {
        return "is not";
    }

    if (lessThanAliases.has(comparisonType)) {
        return "is less than";
    }

    if (greaterThanAliases.has(comparisonType)) {
        return "is greater than";
    }

    return comparisonType;
}

module.exports = {
    id: "firebot:command-args-count",
    name: "コマンド引数カウント",
    description: "コマンドの引数の数に基づく条件",
    triggers: triggers,
    comparisonTypes: ["等しい", "等しくない", "より小さい", "より大きい"],
    leftSideValueType: "none",
    rightSideValueType: "number",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;
        const normalizedComparisonType = normalizeArgsCountComparisonType(comparisonType);

        const args = trigger.metadata.userCommand.args || [];

        const argsCount = args.length;

        switch (normalizedComparisonType) {
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