import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const moment = require("moment");

const model : ReplaceVariable = {
    definition: {
        handle: "time",
        description: "現在時刻を出力.",
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT],
        examples: [
            {
                usage: "time[format,locale]",
                description: '現在時刻を特定のフォーマットで出力する。書式は <a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> に従います.(日本語版拡張:localeに ja,en などの国を指定できます）'
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

export default model;