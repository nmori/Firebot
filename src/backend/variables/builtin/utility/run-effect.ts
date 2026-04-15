import { randomUUID } from "crypto";
import type { ReplaceVariable, Trigger } from "../../../../types/variables";

import effectRunner from "../../../common/effect-runner";
import logger from "../../../logwrapper";


const model : ReplaceVariable = {
    definition: {
        handle: "runEffect",
        usage: "runEffect[effectJson]",
        description: "JSON で定義されたエフェクトを実行します。空文字列を出力します。この変数は柔軟性が高い分エラーが起きやすいため、使い方を理解している場合のみ使用してください。",
        examples: [{
            usage: "runEffect[``{\"type\":\"firebot:chat\",\"message\":\"Hello world\"}``]",
            description: "チャットメッセージエフェクトを実行します。エフェクトの JSON データは UI の「エフェクトを編集」モーダル右上のオーバーフローメニューから取得できます。（エフェクト JSON をコピー > $runEffect[] 用）"
        }],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (
        trigger: Trigger,
        ...effectJsonModels: unknown[]
    ) => {

        try {
            await effectRunner.processEffects({
                trigger,
                effects: {
                    id: randomUUID(),
                    list: effectJsonModels
                        .map((json) => {
                            if (typeof json !== 'string' && !(json instanceof String)) {
                                return json;
                            }

                            try {
                                return JSON.parse(`${json.toString()}`);
                            } catch (error) {
                                logger.warn("Failed to parse effect json in $runEffect", json, error);
                                return null;
                            }
                        }).filter(e => e?.type != null && typeof e?.type === "string")
                }
            });
        } catch (error) {
            logger.warn("Error running effects via $runEffect", error);
        }

        return "";
    }
};

export default model;
