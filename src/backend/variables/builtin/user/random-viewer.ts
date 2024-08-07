import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const logger = require("../../../../backend/logwrapper");
const activeUserHandler = require('../../../chat/chat-listeners/active-user-handler');

const model : ReplaceVariable = {
    definition: {
        handle: "randomViewer",
        description: "ランダムに視聴者を取得",
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: () => {
        logger.debug("Getting random viewer...");

        const onlineViewerCount = activeUserHandler.getOnlineUserCount();

        if (onlineViewerCount === 0) {
            return "[Unable to get random viewer]";
        }

        if (onlineViewerCount > 0) {
            const randomViewer = activeUserHandler.getRandomOnlineUser();
            return randomViewer ? randomViewer.username : "[Unable to get random viewer]";
        }

        return "[Unable to get random viewer]";
    }
};

export default model;
