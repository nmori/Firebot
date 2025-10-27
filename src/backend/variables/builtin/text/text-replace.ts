import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify, escapeRegExp } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "replace",
        description: "検索値を置換値で置き換える。",
        usage: "replace[textInput, searchValue, replacement]",
        examples: [
            {
                usage: "replace[textInput, searchValue, replacement, true]",
                description: "[正規表現](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions)を使って検索できるようにする。"
            },
            {
                usage: "replace[textInput, searchValue, replacement, true, flags]",
                description: "[正規表現](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions)使用時にフラグを追加する。"
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text", "number"]
    },
    evaluator: (
        trigger: Trigger,
        input: string,
        search: string,
        replacement: unknown = "",
        searchIsRegex = false,
        flags: unknown = "g"
    ) : string => {
        if (input == null) {
            return "[不足している入力]";
        }


        if (search == null) {
            return input;
        }
        return stringify(input)
            .replace(
                new RegExp(searchIsRegex ? search : escapeRegExp(search), stringify(flags)),
                stringify(replacement)
            );
    }
};

export default model;
