"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "loopItem",
        usage: "loopItem",
        description: "Arrayループモードを使用するLoop Effect効果内の現在のループ反復の項目",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.loopItem;
    }
};

module.exports = model;
