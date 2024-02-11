import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

const apiProcessor = require("../../../common/handlers/apiProcessor");

const model : ReplaceVariable = {
    definition: {
        handle: "randomDadJoke",
        usage: "randomDadJoke",
        description: "適当なオヤジギャグを言う！",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: () => {
        return apiProcessor.getApiResponse("Dad Joke");
    }
};

export default model;