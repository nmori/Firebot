import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";
import { convertToString, escapeRegExp } from '../../../utility';

const model : ReplaceVariable = {
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
    evaluator: (
        trigger: Trigger,
        input: unknown,
        search: unknown,
        replacement: unknown = "",
        searchIsRegex: unknown = false,
        flags: unknown = "g"
    ) : string => {
        if (input == null) {
            return "[不足している入力]";
        }


        if (search == null) {
            return <string>input;
        }
        return convertToString(input)
            .replace(
                new RegExp(searchIsRegex ? search : escapeRegExp(search), convertToString(flags)),
                convertToString(replacement)
            );
    }
};

export default model;
