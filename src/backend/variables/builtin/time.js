// Migration: done

"use strict";

const moment = require("moment");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "time",
        description: "迴ｾ蝨ｨ譎ょ綾繧貞・蜉・",
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT],
        examples: [
            {
                usage: "time[format,locale]",
                description: '迴ｾ蝨ｨ譎ょ綾繧堤音螳壹・繝輔か繝ｼ繝槭ャ繝医〒蜃ｺ蜉帙☆繧九よ嶌蠑上・ <a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> 縺ｫ蠕薙＞縺ｾ縺・(譌･譛ｬ隱樒沿諡｡蠑ｵ:locale縺ｫ ja,en 縺ｪ縺ｩ縺ｮ蝗ｽ繧呈欠螳壹〒縺阪∪縺呻ｼ・
            },
            {
                usage: "time[YYYY-DD-MM HH:mm:ss]",
                description: "Format with the preferred tokens."
            }
        ]
    },
    evaluator: (_, format = 'h:mm a', locale = 'ja') => {
        const now = moment().locale(locale);
        if(!isNaN(now.format(format)))
        {
            return Number(now.format(format));
        }else{
            return now.format(format);
        }
    }
};

module.exports = model;
