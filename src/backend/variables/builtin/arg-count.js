// Migration: info needed

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "argCount",
        description: "コマンドの引数の数を返す",
        triggers: triggers,
        possibleDataOutput: [OutputDataType.NUMBER],
        categories: [VariableCategory.NUMBERS]
    },
    evaluator: (trigger) => {
        return trigger.metadata.userCommand ? trigger.metadata.userCommand.args.length : 0;
    }
};

module.exports = model;
