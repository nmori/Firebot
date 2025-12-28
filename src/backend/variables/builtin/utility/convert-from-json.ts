import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "convertFromJSON",
        description: "JSON テキストを生のオブジェクト インスタンスに変換します。",
        usage: "convertFromJSON[json text]",
        examples: [
            {
                usage: `convertFromJSON['{"name": "John", "age": 30}']`,
                description: "JSON 文字列を生のオブジェクトとして返します。"
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
                return "[解析エラー]";
            }
        }
        return jsonText;
    }
};

export default model;