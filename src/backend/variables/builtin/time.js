// Migration: done

"use strict";

const moment = require("moment");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "time",
        description: "現在時刻を出力する。",
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT],
        examples: [
            {
                usage: "time[format]",
                description: '現在時刻を特定のフォーマットで出力する。書式は<a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a>の書式規則を使用します。'
            }
        ]
    },
    evaluator: (_, format = 'h:mm a') => {
        const now = moment();
        return now.format(format.toString());
    }
};

module.exports = model;
