import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "false",
        description: "リテラルの false（偽値）を返します。$if[] などの比較で使用できます。",
        usage: "false",
        categories: ["advanced"],
        possibleDataOutput: ["bool"]
    },
    evaluator: () => false
};
export default model;