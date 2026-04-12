// Migration: done

"use strict";

const moment = require("moment");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "date",
        examples: [
            {
                usage: "date[dddd MMMM Do]",
                description: 'Format with the preferred tokens. Format uses <a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> formatting rules.'
            },
            {
                usage: "date[YYYY-DD-MM HH:mm:ss]",
                description: "Format with the preferred tokens."
            },
            {
                usage: "date[MMM Do YYYY, 2, days,locale]",
                description: "迴ｾ蝨ｨ縺ｮ譌･莉倥↓2譌･雜ｳ縺呻ｼ域怦縲∝ｹｴ縺ｪ縺ｩ莉悶・蜊倅ｽ阪ｒ菴ｿ縺・％縺ｨ繧ゅ〒縺阪ｋ・峨・
            },
            {
                usage: "date[MMM Do YYY, -2, days,locale]",
                description: "迴ｾ蝨ｨ縺ｮ譌･莉倥°繧・譌･繧貞ｼ輔￥・医∪縺溘・譛医∝ｹｴ縺ｪ縺ｩ莉悶・蜊倅ｽ阪ｒ菴ｿ縺・ｼ峨・
            }
        ],
        description: "MMM Do YYYY縺ｨ縺励※繝輔か繝ｼ繝槭ャ繝医＆繧後◆迴ｾ蝨ｨ縺ｮ譌･莉倥・(譌･譛ｬ隱樒沿諡｡蠑ｵ:locale縺ｫ ja,en 縺ｪ縺ｩ縺ｮ蝗ｽ繧呈欠螳壹〒縺阪∪縺呻ｼ・,
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, template = 'MMM Do YYYY', steps = 0, key = 'days', locale = 'ja') => {
        const now = moment().locale(locale);
        const stepNumber =Number(steps);

        if (stepNumber > 0 && key !== null) {
            now.add(steps, key);
        }

        if (stepNumber < 0 && key !== null) {
            now.subtract(Math.abs(stepNumber), key);
        }

        return now.format(template);
    }
};

module.exports = model;
