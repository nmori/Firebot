"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const expressionish = require('expressionish');
const moment = require("moment");
const twitchApi = require("../../twitch-api/api");

const model = {
    definition: {
        handle: "rawTopBitsCheerers",
        description: "配信者チャンネルで最も多くのビッツを応援したトップユーザのユーザ名を含む生の配列を返します。",
        examples: [
            {
                usage: "rawTopBitsCheerers[count]",
                description: "配信者チャンネルで最も多くのビッツを応援したユーザの、 指定されたカウントまでのユーザ名を生の配列で返します。"
            },
            {
                usage: "rawTopBitsCheerers[count, period]",
                description: "現在指定されている期間中、配信者チャンネルで最も多くのビッツを応援したユーザの、 指定されたカウントまでのユーザ名の生の配列を返します。期間は 'day'、'week'、'month'、'year' あるいは 'all' のいずれかです。"
            },
            {
                usage: "rawTopBitsCheerers[count, period, startDate]",
                description: "指定した日付に発生した配信者チャンネルで、 指定した期間中に最も多くのビッツを応援したユーザのユーザ名を、 指定したカウント数までの生の配列で返します。期間は 'day'、'week'、'month'、'year' あるいは 'all' のいずれかです。"
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    argsCheck: (count = 1, period = "all", startDate = null) => {
        if (count == null && period == null && startDate == null) {
            return true;
        }

        period = period ?? "all";

        if (Number.isNaN(count) || count < 1 || count > 100) {
            throw new expressionish.ExpressionArgumentsError("第一引数にはNULLか数値を指定する。", 0);
        }

        const validPeriods = ["day", "week", "month", "year", "all"];
        period = period.toLowerCase();

        if (validPeriods.indexOf(period) === -1) {
            throw new expressionish.ExpressionArgumentsError("第2引数には有効な期間（'day'、'week'、'month'、'year'、'all'）を指定する。", 0);
        }

        if (startDate != null && !moment(startDate).isValid()) {
            throw new expressionish.ExpressionArgumentsError("第3引数は有効な日付文字列でなければならない。", 0);
        }

        return true;
    },
    evaluator: async (_, count = 1, period = "all", startDate = null) => {
        count = count ?? 1;
        period = period ?? "all";
        startDate = startDate == null ? moment() : moment(startDate);
        return (await twitchApi.bits.getChannelBitsTopCheerers(count, period, startDate.toDate())).map(v => v);
    }
};

module.exports = model;
