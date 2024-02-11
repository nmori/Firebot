import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "convertFromJSON",
        description: "JSONテキストを生のオブジェクト・インスタンスに変換する。",
        usage: "convertFromJSON[json text]",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (
        trigger: Trigger,
        jsonText: unknown
    ) : unknown => {
        if (jsonText == null) {
            return null;
        }
        if (typeof jsonText === 'string' || jsonText instanceof String) {
            try {
                return JSON.parse(`${jsonText}`);

            } catch (err) {
                return "[PARSE ERROR]";
            }
        }
        return jsonText;
    }
};

export default model;