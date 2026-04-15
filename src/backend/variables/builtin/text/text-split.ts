import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "splitText",
        description: "指定した区切り文字でテキストを分割し、配列で返します。カスタム変数と併用して便利です。",
        usage: "splitText[text, separator]",
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: unknown,
        separator: unknown = ","
    ) : string[] => {
        if (subject == null) {
            return [];
        }
        return stringify(subject).split(stringify(separator));
    }
};

export default model;
