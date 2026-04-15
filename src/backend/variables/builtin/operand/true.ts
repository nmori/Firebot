import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "true",
        description: "リテラルの true（真値）を返します。$if[] などの比較で使用できます。",
        usage: "true",
        categories: ["advanced"],
        possibleDataOutput: ["bool"]
    },
    evaluator: () => true
};
export default model;