import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "ensureNumber",
        description: "数値を確実に出力します。入力が数値の場合はそのまま返し、数値でない場合はデフォルト値を使用します。",
        usage: "ensureNumber[input, defaultNumber]",
        categories: ["numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (
        trigger: Trigger,
        input: unknown,
        defaultNumber: unknown
    ) : number => {
        if (input != null && input !== '' && Number.isFinite(Number(input))) {
            return Number(input);
        }

        return Number.isFinite(Number(defaultNumber)) ? Number(defaultNumber) : 0;
    }
};

export default model;
