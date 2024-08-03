import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const logger = require("../../../../backend/logwrapper");
const activeViewerHandler = require("../../../chat/chat-listeners/active-user-handler");

const model : ReplaceVariable = {
    definition: {
        handle: "activeChatUserCount",
        description: "チャットでアクティブな視聴者の数を取得します。",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async () => {
        logger.debug("Getting number of active viewers in chat.");

        return activeViewerHandler.getActiveUserCount() || 0;
    }
};

export default model;
