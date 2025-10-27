import moment from "moment";

import type { ReplaceVariable } from "../../../../types/variables";

import { AccountAccess } from "../../../common/account-access";
import { TwitchApi } from "../api";
import logger from "../../../logwrapper";


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
        categories: ["user based"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null) {
            username = AccountAccess.getAccounts().streamer.username;
        }

        try {
            const user = await TwitchApi.users.getUserByName(username);

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