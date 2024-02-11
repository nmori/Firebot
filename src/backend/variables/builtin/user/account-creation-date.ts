import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const moment = require("moment");

const twitchApi = require("../../../twitch-api/api");
const accountAccess = require("../../../common/account-access");
const logger = require("../../../logwrapper");

const model : ReplaceVariable = {
    definition: {
        handle: "accountCreationDate",
        description: "Twitchアカウントの作成日。",
        examples: [
            {
                usage: "accountCreationDate[$target]",
                description: "コマンドを入力すると、対象ユーザーのTwitchアカウントの作成日を取得します。"
            },
            {
                usage: "accountCreationDate[$user]",
                description: "関連するユーザーのTwitchアカウントの作成日を取得します。"
            },
            {
                usage: "accountCreationDate[ChannelOne]",
                description: "特定のユーザーのTwitchアカウント/チャンネルの作成日を取得します。"
            }
        ],
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, username) => {
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
export default model;