import moment from "moment";

import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "time",
        description: "現在の時刻を返します。",
        categories: ["common"],
        possibleDataOutput: ["text"],
        examples: [
            {
                usage: "time[format]",
                description: '希望の形式で現在時刻を返します。<a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> のフォーマットルールに従います。'
            },
            {
                usage: "time[YYYY-DD-MM HH:mm:ss]",
                description: "希望のトークンでフォーマットします。"
            }
        ]
    },
    evaluator: (_, format = 'h:mm a') => {
        const now = moment();
        return now.format(format.toString());
    }
};

export default model;