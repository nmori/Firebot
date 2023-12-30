"use strict";

const uuid = require("uuid/v4");

const logger = require("../../logwrapper");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const effectRunner = require("../../common/effect-runner");

const model = {
    definition: {
        handle: "runEffect",
        usage: "runEffect[effectJson]",
        description: "jsonで定義された演出を実行します。空の文字列を出力します。この変数が持つパワーと柔軟性は、非常にエラーが起こりやすいことを意味することに留意してください。自分が何をしているかわかっている場合にのみ使用してください。",
        examples: [{
            usage: "runEffect[``{\"type\":\"firebot:chat\",\"message\":\"Hello world\"}``]",
            description: "チャットメッセージ演出を実行します。演出のJSONデータは、演出編集画面の右上にあるメニューで取得できます。(演出Jsonをコピー > $runEffect[]の場合)"
        }],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, ...effectJsonModels) => {

        try {
            await effectRunner.processEffects({
                trigger,
                effects: {
                    id: uuid(),
                    list: effectJsonModels.map(json => {
                        try {
                            return JSON.parse(json);
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

module.exports = model;
