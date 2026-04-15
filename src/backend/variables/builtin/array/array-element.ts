import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "arrayElement",
        usage: "arrayElement[array, index]",
        description: "入力配列の指定インデックスの要素を返します。",
        examples: [
            {
                usage: 'arrayElement["[1,2,3]", 0]',
                description: "インデックス 0 の要素（1）を返します。"
            },
            {
                usage: 'arrayElement["[1,2,3]", first]',
                description: "最初の要素（1）を返します。"
            },
            {
                usage: 'arrayElement["[1,2,3]", last]',
                description: '最後の要素（3）を返します。'
            },
            {
                usage: 'arrayElement[rawArray, 0]',
                description: "インデックス 0 の要素を返します。"
            },
            {
                usage: 'arrayElement[rawArray, first]',
                description: '最初の要素を返します。'
            },
            {
                usage: 'arrayElement[rawArray, last]',
                description: '最後の要素を返します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"]
    },

    evaluator: (
        trigger: Trigger,
        subject: string | Array<unknown>,
        index: number | string
    ) : unknown => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch {
                return null;
            }
        }

        if (!Array.isArray(subject) || subject.length === 0) {
            return null;
        }
        if (`${index}`.toLowerCase() === 'first') {
            return subject[0];
        }
        if (`${index}`.toLowerCase() === 'last') {
            return subject[subject.length - 1];
        }

        return subject[index];
    }
};

export default model;
