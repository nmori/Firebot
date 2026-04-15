import moment from "moment";

import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "unixTimestamp",
        examples: [
            {
                usage: "unixTimestamp[2011-03-18 18:49 UTC]",
                description: "指定した日時の Unix タイムスタンプ。"
            },
            {
                usage: "unixTimestamp[07/28/2024, MM/DD/YYYY]",
                description: '指定形式の日付の Unix タイムスタンプ。<a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> のフォーマットルール。'
            },
            {
                usage: "unixTimestamp[$accountCreationDate]",
                description: "アカウント作成日の Unix タイムスタンプ。"
            },
            {
                usage: "unixTimestamp[$date[MMM Do YYYY, -14, days], MMM Do YYYY]",
                description: "2週間前の日付の Unix タイムスタンプ。"
            }
        ],
        description: "1970年1月1日 00:00:00 UTC からの秒数で現在の日時を返します（Unix タイムスタンプ）。",
        categories: ["common"],
        possibleDataOutput: ["number"]
    },

    evaluator: (_, date?: string, format?: string) => {
        const time = moment(date, format);

        return time.unix();
    }
};

export default model;
