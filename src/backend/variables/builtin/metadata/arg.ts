import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import type { UserCommand } from "../../../../types/commands";

const expressionish = require('expressionish');

const model : ReplaceVariable = {
    definition: {
        handle: "arg",
        usage: "arg[#]",
        description: "コマンドの引数（!トリガーの後に続く単語）を、指定したインデックスの位置から取得します。",
        examples: [
            {
                usage: "arg[1,2]",
                description: "引数の範囲を取得します。"
            },
            {
                usage: "arg[2,last]",
                description: "2番目から最後の引数までの範囲を取得します。"
            },
            {
                usage: "arg[all]",
                description: "すべての引数を取得します。!コマンドトリガーの後のテキスト全体を取得するのに便利です。"
            }
        ],
        triggers: {
            ["command"]: true,
            ["channel_reward"]: true,
            ["event"]: [
                "twitch:chat-message"
            ],
            ["manual"]: true
        },
        categories: ["trigger based", "common"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: (
        trigger: Trigger,
        index: number,
        upperIndex: number
    ) => {
        let args = trigger.metadata.userCommand?.args
            ?? (trigger.metadata.eventData?.userCommand as UserCommand)?.args
            ?? <string[]>trigger.metadata.args;
        if (args == null || <unknown>args === '') {
            args = [];
        }

        if (String(index).toLowerCase() === "all") {
            return args.join(" ");
        }

        if (index != null) {
            index = parseInt(<string><unknown>index);
        }

        if (index != null && index > 0) {
            index--;
        } else {
            index = 0;
        }

        if (upperIndex == null) {
            return args[index] || "";
        }

        if (<string><unknown>upperIndex === "last") {
            upperIndex = args.length;
        }

        if (upperIndex != null) {
            upperIndex = parseInt(<string><unknown>upperIndex);
        }

        return args.slice(index, upperIndex).join(" ");
    },
    argsCheck: (index: unknown, upperIndex: unknown) => {
        // both args can be null
        if (index == null && upperIndex == null) {
            return true;
        }

        // index needs to either be "all" or a number
        if (String(index).toLowerCase() !== "all" && isNaN(<number>index)) {
            throw new expressionish.ExpressionArgumentsError("First argument needs to be either 'all' or a number.", 0);
        }

        // upperIndex needs to either be null, "last", or a number
        if (upperIndex != null && String(upperIndex).toLowerCase() !== "last" && isNaN(<number>upperIndex)) {
            throw new expressionish.ExpressionArgumentsError("Second argument needs to be either 'last' or a number.", 1);
        }

        return true;
    }
};

export default model;