import { randomUUID } from "node:crypto";
import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

const model: EffectType<{
    message: string;
    port: number;
    username: string;
}> = {
    definition: {
        id: "firebot:send-vrchat",
        name: "ゆかコネNEO経由でVRChatへチャット送信",
        description: "チャットメッセージを送信します",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="通信設定" pad-top="true">
            <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
                <label for="port" class="control-label">連携サーバのHTTPポート</label>
                <input
                    type="number"
                    class="form-control input-lg"
                    id="port"
                    name="port"
                    placeholder="ポート"
                    ng-model="effect.port"
                    required
                    min="0"
                    style="width: 50%;"
                />
                <p class="help-block">ゆかりネットコネクターNEO v2.1～の翻訳/発話連携プラグインと読み上げ連携プラグインが必要です。</p>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.port == null) {
            $scope.effect.port = 8080;
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.port == null) {
            errors.push("ポート番号を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        try {
            const voiceQuery = {
                operation: "chat",
                params: [
                    {
                        id: randomUUID(),
                        text: effect.message,
                        talker: effect.username,
                        target: ["vrchat"]
                    }
                ]
            };

            await fetch(`http://127.0.0.1:${effect.port}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(voiceQuery)
            });
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }

        return true;
    }
};

export = model;
