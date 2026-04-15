import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "textPadEnd",
        description: "テキストの末尾にパディングします。",
        usage: "textPadEnd[input, count, countIsLength, padChar]",
        examples: [
            {
                usage: "textPadEnd[input, count, $false, \" \"]",
                description: "入力の末尾に count 個のスペースを追加します。"
            },
            {
                usage: "textPadEnd[input, count, $true, \" \"]",
                description: "出力の文字数が count になるまで末尾にスペースを追加します。"
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
            return `${input}${padChar.repeat(charsToAdd)}`;
        }

        return `${input}${padChar.repeat(count)}`;
    }
};

export default model;