// Migration: done

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["firebot:custom-variable-set"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "createdCustomVariableData",
        description: "作成されたカスタム変数のデータ",
        triggers: triggers,
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.createdCustomVariableData || "";
    }
};

module.exports = model;
