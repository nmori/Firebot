import frontendCommunicator from "../../../backend/common/frontend-communicator";
import { EffectCategory } from "../../../shared/effect-constants";
import { EffectType } from "../../../types/effects";

const effect: EffectType<{
    text: string;
    voiceId: "default" | string;
    wait?: boolean;
}> = {
    definition: {
        id: "firebot:text-to-speech",
        name: "合成音声",
        description: "Firebotにテキストを読ませる。",
        icon: "fad fa-microphone-alt",
        categories: [EffectCategory.FUN],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="テキスト">
            <textarea ng-model="effect.text" class="form-control" name="text" placeholder="テキストを入力" rows="4" cols="40" replace-variables menu-position="under"></textarea>
        </eos-container>

        <eos-container header="音声" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.voiceId"
                items="ttsVoices"
                placeholder="音声を検索、もしくは選択"
            />
        </eos-container>

        <eos-container header="Wait" pad-top="true">
            <firebot-checkbox
                label="Wait for speech to finish"
                tooltip="Wait for the speech to finish or be cancelled before allowing the next effect to run."
                model="effect.wait"
                style="margin: 0px 15px 0px 0px"
            />
        </eos-container>
    `,
    optionsController: ($scope, ttsService) => {
        if ($scope.effect.voiceId == null) {
            $scope.effect.voiceId = "default";
        }
        if ($scope.effect.wait !== true) {
            $scope.effect.wait = false;
        }

        $scope.ttsVoices = [{
            id: "default",
            name: "Default",
            description: "設定 > 合成音声で選ばれた音声"
        },
        ...ttsService.getVoices()
        ];


        $scope.getSelectedVoiceName = () => {
            const voiceId = $scope.effect.voiceId;
            if (voiceId === "default" || voiceId == null) {
                return "既定の音声";
            }

            const voice = ttsService.getVoiceById(voiceId);

            return voice?.name ?? "不明な音声";
        };
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.text == null || effect.text.length < 1) {
            errors.push("テキストを入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const effect = event.effect;

        await frontendCommunicator.fireEventAsync("read-tts", effect);

        return true;
    }
};

export = effect;
