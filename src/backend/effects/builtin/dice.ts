import { EffectType } from '../../../types/effects';
import { type DiceEffectModel, handleDiceEffect } from "../../common/handlers/dice-processor";

const model: EffectType<DiceEffectModel> = {
    definition: {
        id: "firebot:dice",
        name: "ダイスロール",
        description: "チャットで振るダイスの数を指定します。",
        icon: "fad fa-dice",
        categories: ["fun", "chat based"],
        dependencies: ["chat"]
    },
    optionsTemplate: `
        <eos-container header="ダイスロール">
            <firebot-input
                input-title="ダイス"
                model="effect.dice"
                placeholder-text="2d20 / 2d10+1d12 / 1d10+3 など"
                menu-position="under"
            />
        </eos-container>

        <eos-container header="表示形式" pad-top="true">
            <firebot-radios
                options="displayModeOptions"
                model="effect.resultType"
            />
        </eos-container>

        <eos-chatter-select effect="effect" title="結果の発言者" pad-top="true"></eos-chatter-select>

        <eos-container pad-top="true">
            <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
                <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> ウィスパー
                    <input type="checkbox" ng-init="whisper = (effect.whisper != null && effect.whisper !== '')" ng-model="whisper" ng-click="effect.whisper = ''">
                    <div class="control__indicator"></div>
                </label>
                <div ng-show="whisper">
                    <div class="input-group">
                        <span class="input-group-addon" id="chat-whisper-effect-type">宛先</span>
                        <input ng-model="effect.whisper" type="text" class="form-control" id="chat-whisper-setting" aria-describedby="chat-text-effect-type" placeholder="ユーザー名">
                    </div>
                </div>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.displayModeOptions = {
            sum: { text: "合計のみ", description: "例: 「ebiggz が 2d6 で 7 を出しました」" },
            individual: { text: "各ロール内訳を含める", description: "例: 「ebiggz が 2d6 で 7 (4, 3) を出しました」" }
        };

        $scope.effect.resultType = $scope.effect.resultType
            ? $scope.effect.resultType
            : "sum";
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.dice) {
            errors.push("振るダイスの数を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        await handleDiceEffect(effect, trigger);
        return true;
    }
};

export = model;