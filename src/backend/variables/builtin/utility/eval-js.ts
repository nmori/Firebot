import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import logger from '../../../logwrapper';
import { evalSandboxedJs } from '../../../common/handlers/js-sandbox/sandbox-eval';

const model : ReplaceVariable = {
    definition: {
        handle: "evalJs",
        usage: "evalJs[`` code ``, ...parameters]",
        description: 'サンドボックス化されたブラウザインスタンスで指定した JavaScript を実行します。<br/><br/>パラメータは JS 内で parameters[N] でアクセスできます。<br/>イベントメタデータは metadata.* でアクセスできます。<br/><br/>評価結果を返すには return を使用する必要があります。',
        examples: [
            {
                usage: 'evalJs[``return parameters[0]``, test]',
                description: '$evalJS に渡した最初のパラメータ "test" を返します。'
            },
            {
                usage: 'evalJs[``return metadata.username``]',
                description: 'イベントのメタデータからユーザー名を返します。'
            },
            {
                usage: 'evalJs[``return await Firebot.sum[1,2,3,4]``]',
                description: 'Firebot の sum API を呼び出して結果を返します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["ALL"]
    },
    evaluator: async (trigger: Trigger, code: string, ...args: unknown[]) => {
        try {
            return await evalSandboxedJs(code, args, trigger);

        } catch (err) {
            err.javascript = code;
            err.parameters = args;
            logger.error(err);
            return '[$evalJs Error]';
        }
    }
};

export default model;