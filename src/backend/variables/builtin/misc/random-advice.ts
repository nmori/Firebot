import type { ReplaceVariable } from "../../../../types/variables";
import apiProcessor from "../../../common/handlers/apiProcessor";

const model : ReplaceVariable = {
    definition: {
        handle: "randomAdvice",
        usage: "randomAdvice",
        description: "ランダムなアドバイスを取得します！",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        return await apiProcessor.getApiResponse("Advice");
    }
};

export default model;