"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

function isObjectOrArray(data) {
    return Array.isArray(data) || (typeof data === 'object' && !(data instanceof String));
}

const model = {
    definition: {
        handle: "userMetadata",
        description: "繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ髢｢騾｣莉倥￠繧峨ｌ縺ｦ縺・ｋ繝｡繧ｿ繝・・繧ｿ繧貞叙蠕励＠縺ｾ縺吶・,
        usage: "userMetadata[username, metadataKey]",
        examples: [
            {
                usage: "userMetadata[username, metadataKey, defaultValue]",
                description: "繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ繝・ヵ繧ｩ繝ｫ繝亥､縺悟ｭ伜惠縺励↑縺・ｴ蜷医・縲√ョ繝輔か繝ｫ繝亥､繧呈欠螳壹＠縺ｾ縺吶・
            },
            {
                usage: "userMetadata[username, metadataKey, null, propertyPath]",
                description: "隨ｬ2蠑墓焚縺ｫ繝励Ο繝代ユ繧｣繝代せ・医ラ繝・ヨ險俶ｳ包ｼ峨∪縺溘・驟榊・繧､繝ｳ繝・ャ繧ｯ繧ｹ繧呈欠螳壹☆繧九・
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: async (_, username, key, defaultValue = null, propertyPath = null) => {
        const userDb = require("../../database/userDatabase");
        const data = await userDb.getUserMetadata(username, key, propertyPath);
        if (data == null) {
            return defaultValue;
        }

        if (isObjectOrArray(data)) {
            return JSON.stringify(data);
        }

        return data;
    }
};


module.exports = model;
