// Migration: done

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["firebot:custom-variable-expired"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "expiredCustomVariableData",
        description: "期限切れになったカスタム変数データ",
        triggers: triggers,
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        const expiredCustomVariableData = trigger.metadata.eventData.expiredCustomVariableData;

        return expiredCustomVariableData;
    }
};

module.exports = model;
