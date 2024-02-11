import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

const apiProcessor = require("../../../common/handlers/apiProcessor");

const model : ReplaceVariable = {
    definition: {
        handle: "randomAdvice",
        usage: "randomAdvice",
        description: "適当にアドバイスをもらう！",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: () => {
        return apiProcessor.getApiResponse("Advice");
    }
};

export default model;