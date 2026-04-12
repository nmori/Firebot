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
<<<<<<< HEAD:src/backend/variables/builtin/date.js
                description: "優先トークンを使ったフォーマット."
=======
                description: 'Format with the preferred tokens. Format uses <a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> formatting rules.'
            },
            {
                usage: "date[YYYY-DD-MM HH:mm:ss]",
                description: "Format with the preferred tokens."
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/misc/date.ts
            },
            {
                usage: "date[MMM Do YYYY, 2, days,locale]",
                description: "現在の日付に2日足す（月、年など他の単位を使うこともできる）。"
            },
            {
                usage: "date[MMM Do YYY, -2, days,locale]",
                description: "現在の日付から2日を引く（または月、年など他の単位を使う）。"
            }
        ],
        description: "MMM Do YYYYとしてフォーマットされた現在の日付。 (日本語版拡張:localeに ja,en などの国を指定できます）",
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, template = 'MMM Do YYYY', steps = 0, key = 'days', locale = 'ja') => {
        const now = moment().locale(locale);
<<<<<<< HEAD:src/backend/variables/builtin/date.js
=======
        const stepNumber =Number(steps);
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/misc/date.ts

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
