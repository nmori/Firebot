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
                description: "優先トークンを使ったフォーマット."
            },
            {
                usage: "date[MMM Do YYYY, 2, days]",
                description: "現在の日付に2日足す（月、年など他の単位を使うこともできる）。"
            },
            {
                usage: "date[MMM Do YYY, -2, days]",
                description: "現在の日付から2日を引く（または月、年など他の単位を使う）。"
            }
        ],
        description: "MMM Do YYYYとしてフォーマットされた現在の日付。 ",
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, template = 'MMM Do YYYY', steps = 0, key) => {
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

module.exports = model;
