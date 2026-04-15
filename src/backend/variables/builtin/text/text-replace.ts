import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify, escapeRegExp } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "replace",
        description: "検索値を置換値で置換します。",
        usage: "replace[textInput, searchValue, replacement]",
        examples: [
            {
                usage: "replace[textInput, searchValue, replacement, true]",
                description: "[正規表現](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions)を使って検索できます。"
            },
            {
                usage: "replace[textInput, searchValue, replacement, true, flags]",
                description: "[正規表現](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions)使用時にフラグを追加できます。"
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
            return "[Missing input]";
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
