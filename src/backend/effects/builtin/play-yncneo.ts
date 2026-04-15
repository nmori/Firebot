import { randomUUID } from "node:crypto";
import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

type VoiceCast = {
    name: string;
};

const model: EffectType<{
    message: string;
    voicecast: VoiceCast;
    voicelists: VoiceCast[];
    port: number;
    username: string;
}> = {
    definition: {
        id: "firebot:play-yncneo",
        name: "ゆかコネNEO経由で読み上げ",
        description: "ゆかコネNEOを使って音声読み上げを行います",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="キャスト">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="voicecast-name">{{effect.voicecast ? effect.voicecast.name : '選択...'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu voicecast-name-dropdown">
                    <li ng-repeat="voicelist in effect.voicelists"
                        ng-click="effect.voicecast = voicelist">
                        <a href>{{voicelist.name}}</a>
                    </li>
                </ul>
            </div>
        </eos-container>

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
                <p class="help-block">ゆかりネットコネクターNEO v2.1〜の翻訳/発話連携プラグインと読み上げ連携プラグインが必要です。</p>
            </div>

            <eos-overlay-instance ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" effect="effect" pad-top="true"></eos-overlay-instance>
        </eos-container>
    `,
    optionsController: async ($scope) => {
        if ($scope.effect.port == null) {
            $scope.effect.port = 8080;
        }

        $scope.effect.voicelists = [];

        try {
            const voiceQuery = {
                operation: "speech.getvoicelist",
                params: [{ id: randomUUID() }]
            };
            const response = await fetch(
                `http://127.0.0.1:${$scope.effect.port}/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(voiceQuery)
                }
            );
            const responseData: { voice: string[] } = JSON.parse(await response.text());
            for (const voicecast of responseData.voice) {
                $scope.effect.voicelists.push({ name: voicecast });
            }
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
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
            const engine = effect.voicecast.name.split("/");
            const voiceQuery = {
                operation: "speech",
                params: [
                    {
                        id: randomUUID(),
                        text: effect.message,
                        talker: effect.username,
                        voiceCast: engine[0],
                        voiceEngine: engine[1]
                    }
                ]
            };

            await fetch(
                `http://127.0.0.1:${effect.port}/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(voiceQuery)
                }
            );
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }

        return true;
    }
};

export = model;
