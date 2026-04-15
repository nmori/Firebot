import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "convertFromJSON",
        description: "JSON テキストを生オブジェクトに変換します。",
        usage: "convertFromJSON[json text]",
        examples: [
            {
                usage: `convertFromJSON['{"name": "John", "age": 30}']`,
                description: "JSON 文字列から生オブジェクトを返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
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
                return JSON.parse(`${jsonText.toString()}`);

            } catch {
                return "[PARSE ERROR]";
            }
        }
        return jsonText;
    }
};

export default model;