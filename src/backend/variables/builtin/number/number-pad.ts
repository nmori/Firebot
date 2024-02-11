import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "padNumber",
        description: "指定された数値を指定された小数点以下の桁数まで繰り上げる。",
        usage: "padNumber[value, places]",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (
        trigger: Trigger,
        value: string | number,
        places: string | number
    ) : string => {
        const numValue = Number(value);
        const numPlaces = Number(places);
        if (
            value == null || value === "" || !Number.isFinite(numValue) ||
            places == null || places === "" || !Number.isFinite(numPlaces)
        ) {
            return `${value}`;
        }

        const [integer, fraction] = `${numValue}.0`.split(/\./g);

        return `${integer}.${fraction.padEnd(numPlaces, "0")}`;
    }
};

export default model;