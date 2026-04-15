import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "regexMatches",
        description: "[正規表現](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions)で文字列をフィルタリングし、マッチした全結果の配列を返します。",
        usage: "regexMatches[string, expression]",
        examples: [
            {
                usage: "regexMatches[string, expression, flags]",
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
    ) : string[] => {
        if (!`${flags}`.includes('g')) {
            flags = `${flags}g`;
        }

        try {
            const regex = RegExp(`${expression}`, `${flags}`);
            const matches = `${stringToEvaluate}`.match(regex);
            if (!matches) {
                return [];
            }
            return [...matches];

        } catch {
            return [];
        }
    }
};

export default model;