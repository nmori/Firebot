import moment from "moment";

import type { ReplaceVariable } from "../../../../types/variables";

const model: ReplaceVariable = {
    definition: {
        handle: "time",
        description: "現在時刻を出力します。",
        categories: ["common"],
        possibleDataOutput: ["text"],
        examples: [
            {
                usage: "time[format,locale]",
                description: '現在時刻を指定したフォーマットで出力します。書式は <a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> に従います。（日本語版拡張: locale に ja,en などのロケールを指定できます）'
            },
            {
                usage: "time[YYYY-DD-MM HH:mm:ss]",
                description: "指定した書式トークンでフォーマットします。"
            }
        ]
    },
    evaluator: (_, format: string = "HH:mm", locale: moment.LocaleSpecifier = "ja") => {
        const now = moment().locale(locale);
        return now.format(format);
    }
};

export default model;