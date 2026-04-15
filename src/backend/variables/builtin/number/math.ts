import { evaluate } from 'mathjs';
import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import logger from "../../../logwrapper";

const model : ReplaceVariable = {
    definition: {
        handle: "math",
        usage: "math[expression]",
        description: '<a href="https://mathjs.org/docs/index.html">math.js</a> を使って数式を計算します。',
        examples: [
            {
                usage: "math[2 + 2]",
                description: `4 を返します`
            },
            {
                usage: "math[5 * (3 + 2)]",
                description: `25 を返します`
            }
        ],
        categories: ["common", "numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (
        trigger: Trigger,
        subject: string
    ) : number => {

        // mathjs doesn't have types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let evaluation : any;
        try {
            evaluation = evaluate(subject.toString());
        } catch (err) {
            logger.warn("error parsing math expression", (err as Error).message);
            evaluation = -1;
        }
        if (evaluation != null && typeof evaluation === "object") {
            if (evaluation.entries.length > 0) {
                evaluation = evaluation.entries[0];
            } else {
                evaluation = -1;
            }
        }
        return evaluation != null ? evaluation : -1;
    },

    argsCheck: (exp: string) => {
        if (exp == null || exp.length < 1) {
            throw new SyntaxError("A math expression must be included!");
        }

        return true;
    }
};

export default model;
