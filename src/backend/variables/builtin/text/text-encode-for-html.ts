import { encode } from 'he';

import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "encodeForHtml",
        description: "HTML テンプレートで安全に使用できるように文字列を HTML エンコードします。",
        usage: "encodeForHtml[text]",
        examples: [
            {
                usage: "encodeForHtml[<p>Hello & Welcome!</p>]",
                description: `"&lt;p&gt;Hello &amp; Welcome!&lt;/p&gt;" を返します。`
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        text: unknown
    ) : string => {
        return encode(stringify(text));
    }
};

export default model;
