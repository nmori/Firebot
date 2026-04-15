import type { ReplaceVariable } from "../../../../types/variables";

const moment = require("moment");

const model : ReplaceVariable = {
    definition: {
        handle: "date",
        examples: [
            {
                usage: "date[dddd MMMM Do]",
                description: '希望のトークンでフォーマットします。<a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> のフォーマットルールに従います。'
            },
            {
                usage: "date[YYYY-DD-MM HH:mm:ss]",
                description: "希望のトークンでフォーマットします。"
            },
            {
                usage: "date[MMM Do YYYY, 2, days]",
                description: "現在日時に2日加算します（months、yearsなど他の単位も使用可）。"
            },
            {
                usage: "date[MMM Do YYY, -2, days]",
                description: "現在日時か㉈2日引きます（months、yearsなど他の単位も使用可）。"
            }
        ],
        description: "MMM Do YYYY 形式で現在の日付を返します。",
        categories: ["common"],
        possibleDataOutput: ["text"]
    },

    evaluator: (_, template = 'MMM Do YYYY', steps: number = 0, key) => {
        const now = moment();

        if (steps > 0 && key !== null) {
            now.add(steps, key);
        }

        if (steps < 0 && key !== null) {
            now.subtract(Math.abs(steps), key);
        }

        return now.format(template.toString());
    }
};

export default model;
