"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "word",
        description: "指定された文の指定された位置にある単語を取得する",
        usage: "word[text, #]",
        examples: [
            {
                usage: 'word[This is a test, 4]',
                description: "4番目の単語を取得します。この例では「テスト」"
            }
        ],
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text, position) => {
        if (text == null) {
            return "[No text provided]";
        }

        const index = parseInt(position);
        if (isNaN(index)) {
            return "[Position not number]";
        }

        const word = text.split(" ")[index - 1];

        return word || "[No word at position]";
    }
};

module.exports = model;
