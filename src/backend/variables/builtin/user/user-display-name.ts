import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

import logger from "../../../logwrapper";
import viewerDatabase from "../../../viewers/viewer-database";
import twitchApi from "../../../twitch-api/api";

const model : ReplaceVariable = {
    definition: {
        handle: "userDisplayName",
        usage: "userDisplayName[username]",
        description: "指定されたユーザー名の表示名を取得します。最初にローカルの視聴者DBを検索し、次にTwitch APIを検索します。",
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null) {
            const userDisplayName = trigger.metadata.userDisplayName ?? trigger.metadata.userDisplayName;
            if (userDisplayName != null) {
                return userDisplayName;
            }
            username = trigger.metadata.username;
            if (username == null) {
                return "[No username available]";
            }
        }
        const viewer = await viewerDatabase.getViewerByUsername(username);
        if (viewer != null) {
            return viewer.displayName;
        }

        try {
            const user = await twitchApi.users.getUserByName(username);
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
