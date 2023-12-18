"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const expressionish = require('expressionish');
const moment = require("moment");
const twitchApi = require("../../twitch-api/api");

const model = {
    definition: {
        handle: "rawBitsLeaderboard",
        usage: "rawBitsLeaderboard[count]",
        description: "配信者チャンネルの全ビッツのリーダーボードを、指定されたカウントまでの生の配列で返す。配列の各項目は `username` と `amount` プロパティを持つ。",
        examples: [
            {
                usage: "rawBitsLeaderboard[count, period]",
                description: "現在の指定された期間における、指定された回数までの配信者チャンネルのビッツのリーダーボードの生の配列を返す。配列の各オブジェクトは `username` と `amount` を持つ。期間は 'day'、'week'、'month'、'year' あるいは 'all' のいずれかである。"
            },
            {
                usage: "rawBitsLeaderboard[count, period, startDate]",
                description: "指定された日付に発生した、指定された期間中の配信者のチャンネルのビッツリーダーボードを、指定されたカウントまで生の配列で返す。配列の各オブジェクトは `username` と `amount` を持つ。期間は 'day'、'week'、'month'、'year' あるいは 'all' のいずれかである。"
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.ADVANCED],
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
    evaluator: async (_, count = 10, period = "all", startDate = null) => {
        count = count ?? 1;
        period = (period ?? "all").toLowerCase();
        startDate = startDate == null ? moment() : moment(startDate);

        const leaderboard = await twitchApi.bits.getChannelBitsLeaderboard(count, period, startDate.toDate());

        return leaderboard.map(l => ({
            username: l.userName,
            amount: l.amount
        }));
    }
};

module.exports = model;
