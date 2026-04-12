
"use strict";
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const twitchApi = require("../../twitch-api/api");
const accountAccess = require("../../common/account-access");
const moment = require("moment");
const logger = require("../../logwrapper");

const twitchApi = require("../../../twitch-api/api");
const accountAccess = require("../../../common/account-access");
const logger = require("../../../../backend/logwrapper");

const model : ReplaceVariable = {
    definition: {
        handle: "accountCreationDate",
        description: "Twitch繧｢繧ｫ繧ｦ繝ｳ繝医・菴懈・譌･縲・,
        examples: [
            {
                usage: "accountCreationDate[$target]",
                description: "繧ｳ繝槭Φ繝峨ｒ蜈･蜉帙☆繧九→縲∝ｯｾ雎｡繝ｦ繝ｼ繧ｶ繝ｼ縺ｮTwitch繧｢繧ｫ繧ｦ繝ｳ繝医・菴懈・譌･繧貞叙蠕励＠縺ｾ縺吶・
            },
            {
                usage: "accountCreationDate[$user]",
                description: "髢｢騾｣縺吶ｋ繝ｦ繝ｼ繧ｶ繝ｼ縺ｮTwitch繧｢繧ｫ繧ｦ繝ｳ繝医・菴懈・譌･繧貞叙蠕励＠縺ｾ縺吶・
            },
            {
                usage: "accountCreationDate[ChannelOne]",
                description: "迚ｹ螳壹・繝ｦ繝ｼ繧ｶ繝ｼ縺ｮTwitch繧｢繧ｫ繧ｦ繝ｳ繝・繝√Ε繝ｳ繝阪Ν縺ｮ菴懈・譌･繧貞叙蠕励＠縺ｾ縺吶・
            }
        ],
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, username) => {
        if (username == null) {
            username = accountAccess.getAccounts().streamer.username;
        }

        try {
            const user = await twitchApi.users.getUserByName(username);

            if (user && user.creationDate) {
                const creationDate = moment.utc(user.creationDate).format("YYYY-MM-DD HH:mm UTC");
                return creationDate;
            }

            return null;
        } catch (error) {
            logger.debug("Failed to get account creation date", error);
            return null;
        }
    }
};
module.exports = model;
