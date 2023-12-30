"use strict";

const {
    EffectTrigger
} = require("../../../../../../shared/effect-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.MANUAL] = true;

module.exports = {
    id: "firebot:command-args-count",
    name: "�R�}���h�����J�E���g",
    description: "�R�}���h�̈����̐��Ɋ�Â�����",
    triggers: triggers,
    comparisonTypes: ["��v", "�s��v", "����", "����"],
    leftSideValueType: "none",
    rightSideValueType: "number",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;

        const args = trigger.metadata.userCommand.args || [];

        const argsCount = args.length;

        switch (comparisonType) {
        case "is":
        case "��v":
            return argsCount === rightSideValue;
        case "is not":
        case "�s��v":
            return argsCount !== rightSideValue;
        case "is less than":
        case "����":
            return argsCount < rightSideValue;
        case "is greater than":
        case "����":
            return argsCount > rightSideValue;
        default:
            return false;
        }
    }
};