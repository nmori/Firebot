import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: 'arrayAdd',
        description: '要素を追加した新しい配列を返します。',
        usage: 'arrayAdd[array, new-item, at-start]',
        examples: [
            {
                usage: 'arrayAdd["[1,2,3]", 4]',
                description: '4 を末尾に追加した新しい配列を返します。(1,2,3,4)'
            },
            {
                usage: 'arrayAdd["[1,2,3]", 4, true]',
                description: '4 を先頭に追加した新しい配列を返します。(4,1,2,3)'
            },
            {
                usage: 'arrayAdd[rawArray, 4]',
                description: '4 を末尾に追加した新しい生配列を返します。'
            },
            {
                usage: 'arrayAdd[rawArray, 4, true]',
                description: '4 を先頭に追加した新しい生配列を返します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },

    evaluator: (
        trigger: Trigger,
        subject: string | Array<unknown>,
        item: unknown,
        prepend: boolean | string = false
    ) : Array<unknown> => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);


            } catch (ignore) {}
        }
        if (!Array.isArray(subject)) {
            return [item];
        }

        if (prepend === true || prepend === "true") {
            return [item, ...subject];
        }

        return [...subject, item];
    }
};

export default model;