import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "regexTest",
        description: "[正規表現](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions)に文字列が一致するか確認します。",
        usage: "regexTest[string, expression]",
        examples: [
            {
                usage: "regexTest[string, expression, flags]",
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
    ) : boolean => {
        try {
            const regex = RegExp(`${expression}`, `${flags}`);
            return regex.test(`${stringToEvaluate}`);
        } catch {
            return false;
        }
    }
};

export default model;
