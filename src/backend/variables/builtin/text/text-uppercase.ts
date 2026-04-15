import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "uppercase",
        description: "入力テキスト全体を大文字に変換します。",
        usage: "uppercase[text]",
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        text: unknown
    ) : string => {
        return stringify(text).toUpperCase();
    }
};

export default model;