import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "regexExec",
        description: "[正規表現](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions)で文字列をフィルタリングします。",
        usage: "regexExec[string, expression]",
        examples: [
            {
                usage: "regexExec[string, expression, flags]",
                description: "正規表現にフラグを追加します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        stringToEvaluate: unknown,
        expression: unknown,
        flags: unknown = "g"
    ) : Array<string> => {
        try {
            const regex = RegExp(`${expression}`, `${flags}`);
            return regex
                .exec(`${stringToEvaluate}`)
                .filter(m => !!m);

        } catch {
            return [];
        }
    }
};

export default model;
