import moment from "moment";

import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "unixTimestamp",
        examples: [
            {
                usage: "unixTimestamp[2011-03-18 18:49 UTC]",
                description: "指定した日付の UNIX タイムスタンプを返します。"
            },
            {
                usage: "unixTimestamp[07/28/2024, MM/DD/YYYY]",
                description: '指定した書式で日付を解釈し、UNIX タイムスタンプを返します。書式は <a href="https://momentjs.com/docs/#/displaying/format/">moment.js</a> に従います。'
            },
            {
                usage: "unixTimestamp[$accountCreationDate]",
                description: "指定したアカウント作成日の UNIX タイムスタンプを返します。"
            },
            {
                usage: "unixTimestamp[$date[MMM Do YYYY, -14, days], MMM Do YYYY]",
                description: "2 週間前の日付変数（MMM Do YYYY 形式）の UNIX タイムスタンプを返します。"
            }
        ],
        description: "現在の日付を 1970 年 1 月 1 日 00:00:00 UTC からの経過秒として返します。",
        categories: ["common"],
        possibleDataOutput: ["number"]
    },

    evaluator: (_, date?: string, format?: string) => {
        const time = moment(date, format);

        return time.unix();
    }
};

export default model;
