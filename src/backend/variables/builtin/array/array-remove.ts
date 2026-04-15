import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "arrayRemove",
        description: "指定したインデックスの要素を取り除いた新しい配列を返します。",
        usage: "arrayRemove[array, index]",
        examples: [
            {
                usage: 'arrayRemove["[1,2,3]", 0]',
                description: "インデックス 0 の要素を削除します。(2,3)"
            },
            {
                usage: 'arrayRemove["[1,2,3]", first]',
                description: "最初の要素を削除します。(2,3)"
            },
            {
                usage: 'arrayRemove["[1,2,3]", last]',
                description: '最後の要素を削除します。(1,2)'
            },
            {
                usage: 'arrayRemove[rawArray, 0]',
                description: "インデックス 0 の要素を削除します。"
            },
            {
                usage: 'arrayRemove[rawArray, first]',
                description: '最初の要素を削除します。'
            },
            {
                usage: 'arrayRemove[rawArray, last]',
                description: '最後の要素を削除します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: string | unknown[],
        index: number | string = 0
    ) : unknown[] => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch (ignore) {
                return [];
            }
        }
        if (!Array.isArray(subject) || subject.length < 2) {
            return [];
        }
        if (`${index}`.toLowerCase() === 'last') {
            return subject.slice(0, subject.length - 1);
        }
        if (`${index}`.toLowerCase() === 'first') {
            return subject.slice(1);
        }
        index = Number(index);
        if (Number.isNaN(index)) {
            return [...subject];
        }
        subject = [...subject];
        subject.splice(index, 1);
        return subject;
    }
};

export default model;