import type { ReplaceVariable } from "../../../../types/variables";
import apiProcessor from "../../../common/handlers/apiProcessor";

const model : ReplaceVariable = {
    definition: {
        handle: "randomAdvice",
        usage: "randomAdvice",
        description: "適当にアドバイスをもらう！",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        return await apiProcessor.getApiResponse("Advice");
    }
};

export default model;