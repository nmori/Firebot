import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "textContains",
        usage: "textContains[text, search]",
        description: "文字列に検索内容が含まれる場合は true を、含まれない場偂は false を返します。",
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: unknown = "",
        search: unknown = ""
    ) : boolean => {
        return stringify(subject).includes(stringify(search));
    }
};

export default model;