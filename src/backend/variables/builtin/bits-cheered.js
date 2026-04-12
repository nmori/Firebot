"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const expressionish = require('expressionish');
const moment = require("moment");
const logger = require("../../../../../backend/logwrapper");
const twitchApi = require("../../../../twitch-api/api");

const model = {
    definition: {
        handle: "bitsCheered",
        usage: "bitsCheered[username]",
        description: "謖・ｮ壹＆繧後◆繝ｦ繝ｼ繧ｶ繝ｼ縺碁・菫｡閠・・繝√Ε繝ｳ繝阪Ν縺ｧ蠢懈抄縺励◆繝薙ャ繝・・蜈ｨ譎る俣謨ｰ繧定ｿ斐☆縲・,
        examples: [
            {
                usage: "bitsCheered[username, period]",
                description: "謖・ｮ壹＠縺溘Θ繝ｼ繧ｶ縺後∵欠螳壹＠縺滓悄髢謎ｸｭ縺ｫ驟堺ｿ｡閠・・繝√Ε繝ｳ繝阪Ν縺ｧ蠢懈抄縺励◆繝薙ャ繝・焚繧定ｿ斐＠縺ｾ縺吶よ悄髢薙・ 'day'縲・week'縲・month'縲・year' 縺ゅｋ縺・・ 'all' 縺ｮ縺・★繧後°縲・
            },
            {
                usage: "bitsCheered[username, period, startDate]",
                description: "謖・ｮ壹＆繧後◆譌･莉倥↓逋ｺ逕溘＠縺滄・菫｡閠・・繝√Ε繝ｳ繝阪Ν縺ｧ縲∵欠螳壹＆繧後◆譛滄俣荳ｭ縺ｫ謖・ｮ壹＆繧後◆繝ｦ繝ｼ繧ｶ縺悟ｿ懈抄縺励◆繝薙ャ繝・焚繧定ｿ斐＠縺ｾ縺吶よ悄髢薙・ 'day'縲・week'縲・month'縲・year' 縺ゅｋ縺・・ 'all' 縺ｮ縺・★繧後°縲・
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
