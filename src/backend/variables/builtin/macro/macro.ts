import type { ReplaceVariable, Trigger } from "../../../../types/variables";

import macroManager from '../../macro-manager';

import { ReplaceVariableManager } from '../../replace-variable-manager';

const model : ReplaceVariable = {
    definition: {
        handle: 'macro',
        description: 'ユーザー定義のマクロを呼び出します。',
        hidden: true,
        possibleDataOutput: ["text"]
    },
    evaluator(trigger: Trigger, name: string, ...macroArgs: unknown[]) {
        const macro = macroManager.getMacroByName(name);
        if (macro == null) {
            return null;
        }
        const { argNames: macroArgNames } = macro;
        return ReplaceVariableManager.evaluateText(macro.expression, { macroArgs, macroArgNames }, trigger);
    }
};
export default model;