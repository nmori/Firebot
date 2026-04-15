import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "textPadStart",
        description: "テキストの先頭にパディングします。",
        usage: "textPadStart[input, count, countIsLength, padChar]",
        examples: [
            {
                usage: "textPadStart[input, count, $false, \" \"]",
                description: "入力の先頭に count 個のスペースを追加します。"
            },
            {
                usage: "textPadStart[input, count, $true, \" \"]",
                description: "出力の文字数が count になるまで先頭にスペースを追加します。"
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text", "number"]
    },
    evaluator(trigger: Trigger, input: string, count: number, countIsLength: null | string | boolean, padChar: null | string = " ") {
        if (input === null) {
            return '';
        }
        input = `${input}`;

        // verify count
        count = Number(count);
        if (!Number.isInteger(count) || count < 0) {
            return '';
        }

        if (padChar == null || padChar === '') {
            padChar = " ";
        }
        padChar = `${padChar}`;

        if (
            countIsLength != null &&
            countIsLength !== 'null' &&
            countIsLength !== false &&
            countIsLength !== 'false' &&
            countIsLength !== '$false' &&
            <unknown>countIsLength !== 0 &&
            countIsLength !== '0' &&
            countIsLength !== ''
        ) {
            const charsToAdd = count - input.length;
            if (charsToAdd < 1) {
                return input;
            }
            return `${padChar.repeat(charsToAdd)}${input}`;
        }

        return `${padChar.repeat(count)}${input}`;
    }
};

export default model;