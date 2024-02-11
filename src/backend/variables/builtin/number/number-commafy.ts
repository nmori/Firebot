import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "commafy",
        description: "数値に適切なカンマを追加する。",
        usage: "commafy[number]",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (
        trigger: Trigger,
        subject: unknown
    ) : string => {
        const number = Number(subject);
        if (!Number.isFinite(number)) {
            return "[Error: not a number]";
        }
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};

export default model;
