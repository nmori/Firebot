import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "round",
        description: "指定した数値を最も近い整数に四捨五入します。",
        usage: "round[num]",
        examples: [
            {
                usage: "round[num, places]",
                description: "指定した小数点以下の桁数に四捨五入します。"
            }
        ],
        categories: ["numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (
        trigger: Trigger,
        subject: number | string,
        places: null | number | string
    ) : number => {
        subject = Number(subject);
        if (Number.isNaN(subject)) {
            return 0;
        }

        places = Number(places);
        if (Number.isNaN(places) || places < 0 || places > 50) {
            return Math.round(subject);
        }

        return Number(subject.toFixed(places));
    }
};

export default model;