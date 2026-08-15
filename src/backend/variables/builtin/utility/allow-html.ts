import type { ReplaceVariable } from "../../../../types/variables";

const allowHtmlVariable: ReplaceVariable = {
    definition: {
        handle: "allowHtml",
        usage: "allowHtml[$otherVariable]",
        description: "通常は HTML が使用できない場所でも HTML を使えるようにします。",
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: (trigger, arg: string) => arg
};

export default allowHtmlVariable;