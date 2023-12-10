// Migration: info needed

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const expressionish = require('expressionish');

const model = {
    definition: {
        handle: "arg",
        usage: "arg[#]",
        description: "指定されたインデックスのコマンド引数（コマンド!triggerの後の単語）を取得します",
        examples: [
            {
                usage: "arg[1,2]",
                description: "引数の範囲を取得する"
            },
            {
                usage: "arg[2,last]",
                description: "最後の引数まで、引数の範囲を取得する。"
            },
            {
                usage: "arg[all]",
                description: "すべての引数を取得する。これは、!commandトリガーの後の全てのテキストを取得する良い方法です。"
            }
        ],
        triggers: {
            [EffectTrigger.COMMAND]: true,
            [EffectTrigger.MANUAL]: true
        },
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: (trigger, index, upperIndex) => {
        let args = trigger.metadata.userCommand.args;
        if (args == null || args === '') {
            args = [];
        }

        if (String(index).toLowerCase() === "all") {
            return args.join(" ");
        }

        if (index != null) {
            index = parseInt(index);
        }

        if (index != null && index > 0) {
            index--;
        } else {
            index = 0;
        }

        if (upperIndex == null) {
            return args[index] || "";
        }

        if (upperIndex === "last") {
            upperIndex = args.length;
        }

        if (upperIndex != null) {
            upperIndex = parseInt(upperIndex);
        }

        return args.slice(index, upperIndex).join(" ");
    },
    argsCheck: (index, upperIndex) => {
        // both args can be null
        if (index == null && upperIndex == null) {
            return true;
        }

        // index needs to either be "all" or a number
        if (String(index).toLowerCase() !== "all" && isNaN(index)) {
            throw new expressionish.ExpressionArgumentsError("第一引数には'all'か数字を指定する。", 0);
        }

        // upperIndex needs to either be null, "last", or a number
        if (upperIndex != null && String(upperIndex).toLowerCase() !== "last" && isNaN(upperIndex)) {
            throw new expressionish.ExpressionArgumentsError("第2引数には'last'か数字を指定する。", 1);
        }

        return true;
    }
};

module.exports = model;
