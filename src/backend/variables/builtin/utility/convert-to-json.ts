import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "convertToJSON",
        description: "生の値をJSONテキストに変換します。",
        usage: "convertToJSON[raw value]",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (
        trigger: Trigger,
        jsonText: unknown
    ) : string => {
        if (jsonText == null) {
            return "null";
        }
        try {
            return JSON.stringify(jsonText);
        } catch (ignore) {
            return "null";
        }
    }
};

export default model;