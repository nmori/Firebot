// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const utils = require("../../utility");

const model = {
    definition: {
        handle: "replace",
        description: "検索値を置換値で置き換える。",
        usage: "replace[textInput, searchValue, replacement]",
        examples: [
            {
                usage: "replace[textInput, searchValue, replacement, true]",
                description: "正規表現を使って検索できるようにする。"
            },
            {
                usage: "replace[textInput, searchValue, replacement, true, flags]",
                description: "正規表現使用時にフラグを追加する。"
            }
        ],
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT, OutputDataType.NUMBER]
    },
    evaluator: (_, input, search, replacement = "", searchIsRegex = false, flags = "g") => {

        if (input == null) {
            return "[不足している入力]";
        }

        if (search == null) {
            return input;
        }

        return input.replace(new RegExp(searchIsRegex ? search : utils.escapeRegExp(search), flags), replacement);
    }
};

module.exports = model;
