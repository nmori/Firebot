// Migration: done

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "count",
        usage: "count",
        description: "指定されたコマンドの実行回数を表示する。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, OutputDataType.NUMBER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        const count = trigger.metadata.command && trigger.metadata.command.count;
        return count || 0;
    }
};

module.exports = model;
