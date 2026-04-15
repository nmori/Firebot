import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "word",
        description: "指定した文中の指定位置の単語を取得します。",
        usage: "word[text, #]",
        examples: [
            {
                usage: 'word[This is a test, 4]',
                description: "4番目の単語を取得します。この例では 'test' を返します。"
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: unknown,
        position: unknown
    ) : string => {
        if (subject == null) {
            return "[No text provided]";
        }
        const text = stringify(subject);

        let index : number;
        if (position == null) {
            position = 0;
        } else if (!Number.isFinite(Number(position))) {
            return "[Position not number]";
        } else {
            index = Number(position);
        }

        const word = text.split(" ")[index - 1];
        return word || "[No word at position]";
    }
};

export default model;
