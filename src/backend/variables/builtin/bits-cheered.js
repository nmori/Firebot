"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const expressionish = require('expressionish');
const moment = require("moment");
const logger = require("../../logwrapper");
const twitchApi = require("../../twitch-api/api");

const model = {
    definition: {
        handle: "bitsCheered",
        usage: "bitsCheered[username]",
        description: "指定されたユーザーが配信者のチャンネルで応援したビッツの全時間数を返す。",
        examples: [
            {
                usage: "bitsCheered[username, period]",
                description: "指定したユーザが、指定した期間中に配信者のチャンネルで応援したビッツ数を返します。期間は 'day'、'week'、'month'、'year' あるいは 'all' のいずれか。"
            },
            {
                usage: "bitsCheered[username, period, startDate]",
                description: "指定された日付に発生した配信者のチャンネルで、指定された期間中に指定されたユーザが応援したビッツ数を返します。期間は 'day'、'week'、'month'、'year' あるいは 'all' のいずれか。"
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    argsCheck: (username, period = "all", startDate = null) => {
        period = period ?? "all";

        if (username == null || username.length < 1) {
            throw new expressionish.ExpressionArgumentsError("First argument needs to be a valid username.", 0);
        }

        const validPeriods = ["day", "week", "month", "year", "all"];
        period = period.toLowerCase();

        if (validPeriods.indexOf(period) === -1) {
            throw new expressionish.ExpressionArgumentsError("Second argument must be a valid period ('day', 'week', 'month', 'year', or 'all').", 0);
        }

        if (startDate != null && !moment(startDate).isValid()) {
            throw new expressionish.ExpressionArgumentsError("Third argument must be a valid date string.", 0);
        }

        return true;
    },
    evaluator: async (trigger, username = null, period = "all", startDate = null) => {
        username = username ?? trigger.metadata.username;
        period = period ?? "all";
        startDate = startDate == null ? moment() : moment(startDate);

        let amount = 0;

        try {
            const user = await twitchApi.users.getUserByName(username);

            if (user == null) {
                logger.warn(`Could not found a Twitch user with the username ${username}`);
                return 0;
            }

            const users = await twitchApi.bits.getChannelBitsLeaderboard(1, period, startDate.toDate(), user.id);

            if (users.length === 0) {
                return 0;
            }

            amount = users.length === 1 ? users[0].amount : 0;
        } catch (error) {
            // Swallow exception
        }

        return amount;
    }
};

module.exports = model;
