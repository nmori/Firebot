import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import logger from '../../../logwrapper';
import { evalSandboxedJs } from '../../../common/handlers/js-sandbox/sandbox-eval';

const model : ReplaceVariable = {
    definition: {
        handle: "evalJs",
        usage: "evalJs[`` code ``, ...parameters]",
        description: 'サンドボックス化されたブラウザ環境で指定した JS を評価します。<br/><br/>パラメーターには JS 内で parameters[N] からアクセスできます。<br/>イベントメタデータには metadata.* からアクセスできます。<br/><br/>評価結果を返すには return 文を使用してください。',
        examples: [
            {
                usage: 'evalJs[``return parameters[0]``, test]',
                description: '最初のパラメーター（"test"）を返します。'
            },
            {
                usage: 'evalJs[``return metadata.username``]',
                description: 'イベントメタデータの username を返します。'
            },
            {
                usage: 'evalJs[``return await Firebot.sum[1,2,3,4]``]',
                description: 'firebot の sum API を呼び出し、その結果を返します。'
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
            return '[$evalJs エラー]';
        }
    }
};

export default model;