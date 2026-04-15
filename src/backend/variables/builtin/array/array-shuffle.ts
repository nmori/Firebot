import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const shuffle = (subject: unknown[]) : unknown[] => {
    const arrayCopy = subject.slice(0);

    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }

    return arrayCopy;
};

const model : ReplaceVariable = {
    definition: {
        handle: "arrayShuffle",
        description: "シャッフルした新しい配列を返します。",
        usage: "arrayShuffle[array]",
        examples: [
            {
                usage: `arrayShuffle["[1,2,3]"]`,
                description: "[1,2,3] をシャッフルして返します。（例: [2,1,3]）"
            },
            {
                usage: "arrayShuffle[rawArray]",
                description: "生配列をシャッフルして返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },

    evaluator: (
        trigger: Trigger,
        subject: string | unknown[]
    ) : unknown[] => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch (ignore) {
                return [];
            }
        }
        if (!Array.isArray(subject)) {
            return [];
        }

        return shuffle(subject);
    }
};

export default model;