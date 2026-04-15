import type { ReplaceVariable } from "../../../../types/variables";

import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import viewerDatabase from "../../../viewers/viewer-database";
import logger from "../../../logwrapper";

const model : ReplaceVariable = {
    definition: {
        handle: "userDisplayName",
        usage: "userDisplayName",
        description: "トリガーに関連するユーザーのフォーマットされた表示名を取得します。",
        categories: ["user based"],
        possibleDataOutput: ["text"],
        examples: [
            {
                usage: "userDisplayName[username]",
                description: "指定したユーザー名の表示名を返します。まずビューアー DB、次に Twitch API を検索します。"
            }
        ]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null) {
            const userDisplayName = trigger.metadata?.eventData?.userDisplayName ?? trigger.metadata?.userDisplayName;
            if (userDisplayName != null) {
                return userDisplayName;
            }
            username = (trigger.metadata?.eventData?.username ?? trigger.metadata?.username) as string;
            if (username == null) {
                return "[No username available]";
            }
        }
        const viewer = await viewerDatabase.getViewerByUsername(username);
        if (viewer != null) {
            return viewer.displayName;
        }

        try {
            const user = await TwitchApi.users.getUserByName(username);
            if (user != null) {
                return user.displayName;
            }
            return "[No user found]";
        } catch (error) {
            logger.debug(`Unable to find user with name "${username}"`, error);
            return "[Error]";
        }
    }
};

export default model;
