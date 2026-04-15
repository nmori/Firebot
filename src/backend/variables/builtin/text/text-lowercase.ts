import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "lowercase",
        description: "入力テキスト全体を小文字に変換します。",
        usage: "lowercase[text]",
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        text: unknown
    ) : string => {
        return stringify(text).toLowerCase();
    }
};

export default model;