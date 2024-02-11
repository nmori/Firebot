import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const moment = require("moment");

const model : ReplaceVariable = {
    definition: {
        handle: "date",
        examples: [
            {
                usage: "date[dddd MMMM Do]",
                description: "優先トークンを使ったフォーマット."
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

export default model;
