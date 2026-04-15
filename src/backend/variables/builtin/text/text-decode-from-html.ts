import { decode } from 'he';

import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "decodeFromHtml",
        description: "HTML エンコードされた文字列をデコードします。",
        usage: "decodeFromHtml[text]",
        examples: [
            {
                usage: `decodeFromHtml[&lt;p&gt;Hello &amp; Welcome!&lt;/p&gt;]`,
                description: `"<p>Hello & Welcome!</p>" を返します。`
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        text: unknown
    ) => {
        return decode(stringify(text));
    }
};

export default model;