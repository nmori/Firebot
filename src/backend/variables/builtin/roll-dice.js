// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const { processDice } = require("../../common/handlers/diceProcessor");

const model = {
    definition: {
        handle: "rollDice",
        usage: "rollDice[diceConfig]",
        examples: [
            {
                usage: "rollDice[1d6]",
                description: "6面体のサイコロを1つ振り、合計を出力する。"
            },
            {
                usage: "rollDice[2d10+1d12]",
                description: "10面ダイス2個と12面ダイス1個を振り、合計を出力する。"
            },
            {
                usage: "rollDice[2d6, show each]",
                description: "全ロールの合計と各ロールの値を含むテキストを出力する。例: '10 (4, 6)"
            }
        ],
        description: "2d6、2d10+1d12、1d10+3など、与えられた設定に基づいてサイコロを振る。",
        categories: [VariableCategory.COMMON, VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: (_, diceConfig, option) => {
        const showEach = option?.toLowerCase() === "show each";

        const output = processDice(diceConfig, showEach);

        return (output == null || output === '') ? 0 : output;
    }
};

module.exports = model;
