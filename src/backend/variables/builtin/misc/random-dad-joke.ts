import type { ReplaceVariable } from "../../../../types/variables";
import apiProcessor from "../../../common/handlers/apiProcessor";

const model : ReplaceVariable = {
    definition: {
        handle: "randomDadJoke",
        usage: "randomDadJoke",
        description: "適当なオヤジギャグを言う！",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        return await apiProcessor.getApiResponse("Dad Joke");
    }
};

export default model;