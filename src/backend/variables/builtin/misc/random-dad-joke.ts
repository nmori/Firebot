import type { ReplaceVariable } from "../../../../types/variables";
import apiProcessor from "../../../common/handlers/apiProcessor";

const model : ReplaceVariable = {
    definition: {
        handle: "randomDadJoke",
        usage: "randomDadJoke",
        description: "ランダムなダッドジョークを取得します！",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        return await apiProcessor.getApiResponse("Dad Joke");
    }
};

export default model;