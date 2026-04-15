import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "convertToJSON",
        description: "生の値を JSON テキストに変換します。",
        usage: "convertToJSON[rawValue]",
        examples: [
            {
                usage: "convertToJSON[rawValue, true]",
                description: "生の値をインデント整形した JSON テキストに変換します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        jsonText: unknown,
        prettyPrint?: string
    ) : string => {
        if (jsonText == null) {
            return "null";
        }
        try {
            return JSON.stringify(jsonText, null, prettyPrint === "true" ? 4 : null);
        } catch {
            return "null";
        }
    }
};

export default model;