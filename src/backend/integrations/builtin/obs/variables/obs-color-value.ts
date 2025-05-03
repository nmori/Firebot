import { ReplaceVariable } from "../../../../../types/variables";
import { VariableCategory } from "../../../../../shared/variable-constants";
import tinycolor from "tinycolor2";

export const ColorValueVariable: ReplaceVariable = {
    definition: {
        handle: "obsColorValue",
        description: "16進カラーコード（例：#0066FF）または標準カラー名をもとにOBSカラー値を返します。",
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS],
        possibleDataOutput: ["number"]
    },
    evaluator: (_, ...args: string[]) => {
        let rawValue = tinycolor(args[0]).toHex8();

        rawValue = rawValue.replace("#", "");
        const obsHexValue = `${rawValue.substring(6, 8)}${rawValue.substring(4, 6)}${rawValue.substring(2, 4)}${rawValue.substring(0, 2)}`;

        return parseInt(obsHexValue, 16);
    }
};