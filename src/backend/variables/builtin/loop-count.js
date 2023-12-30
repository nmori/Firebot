// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "loopCount",
        usage: "loopCount",
        description: "ループ・エフェクトの内部で、現在のループ反復を0ベースでカウントする。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        return trigger.metadata.loopCount || 0;
    }
};

module.exports = model;
