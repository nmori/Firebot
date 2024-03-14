import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { EffectTrigger } from "../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;
triggers[EffectTrigger.MANUAL] = true;

/**
 * The $target variable
 */
const model : ReplaceVariable = {
    definition: {
        handle: "target",
        description: "arg変数と似ていますが、先頭の'@'記号を取り除きます。引数がユーザ名であると予想される場合に便利である。",
        usage: "target",
        examples: [
            {
                usage: "target[#]",
                description: "指定されたインデックスのターゲットをつかむ (IE で '!command @ebiggz @TheLastMage' とすると、$target[2] は 'TheLastMage' となる)"
            }
        ],
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger, index: number) => {
        let args = trigger.metadata.userCommand?.args ?? <string[]>trigger.metadata.args;
        if (args == null || <unknown>args === '') {
            args = [];
        }

        index = parseInt(`${index}`);

        if (index != null && index > 0) {
            index--;
        } else {
            index = 0;
        }

        if (args.length < index || args[index] == null) {
            return null;
        }

        return args[index].replace("@", "");
    },
    argsCheck: (index?: number) => {
        // index can be null
        if (index == null) {
            return true;
        }

        // index needs to be a number
        if (isNaN(index)) {
            throw new SyntaxError("Index needs to be a number.");
        }

        return true;
    }
};

export default model;