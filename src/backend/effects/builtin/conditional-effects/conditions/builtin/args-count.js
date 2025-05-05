"use strict";

const {
    EffectTrigger
} = require("../../../../../../shared/effect-constants");
const { ComparisonType } = require("../../../../../../shared/filter-constants");
const logger = require("../../../../../logwrapper");
const { mapLegacyComparisonType } = require("../../../../../../shared/filter-helpers");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.MANUAL] = true;

module.exports = {
    id: "firebot:command-args-count",
    name: "コマンド引数カウント",
    description: "コマンドの引数の数に基づく条件",
    triggers: triggers,
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT,
        ComparisonType.LESS_THAN,
        ComparisonType.GREATER_THAN
    ],
    leftSideValueType: "none",
    rightSideValueType: "number",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;

        const args = trigger.metadata.userCommand.args || [];

        const argsCount = args.length;

        // 旧式のComparisonTypeを標準化
        const standardComparisonType = mapLegacyComparisonType(comparisonType);

        switch (standardComparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.COMPAT2_IS:
            case ComparisonType.ORG_IS:
                return argsCount === rightSideValue;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.COMPAT2_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return argsCount !== rightSideValue;
            case ComparisonType.LESS_THAN:
            case ComparisonType.ORG_THAN:
                return argsCount < rightSideValue;
            case ComparisonType.GREATER_THAN:
            case ComparisonType.COMPAT_GREATER_THAN:
            case ComparisonType.ORG_GREATER_THAN:
                return argsCount > rightSideValue;
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};