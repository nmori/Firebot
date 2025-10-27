import { EffectType } from "../../../types/effects";
import frontendCommunicator from "../../common/frontend-communicator";

interface TtsVoice {
    id: string;
    name: string;
    description: string;
}

const effect: EffectType<{
    text: string;
    voiceId: string;
    wait?: boolean;
}> = {
    definition: {
        id: "firebot:text-to-speech",
        name: "合成音声",
        description: "Firebotにテキストを読ませる。",
        icon: "fad fa-microphone-alt",
        categories: ["fun"],
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

        $scope.ttsVoices = [
            {
            id: "default",
            name: "Default",
            description: "設定 > 合成音声で選ばれた音声"
        },
            ...ttsService.getVoices() as TtsVoice[]
        ] as TtsVoice[];


        $scope.getSelectedVoiceName = () => {
            const voiceId = $scope.effect.voiceId;
            if (voiceId === "default" || voiceId == null) {
                return "既定の音声";
            }

            const voice = ttsService.getVoiceById(voiceId) as TtsVoice;

            return voice?.name ?? "不明な音声";
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.text == null || effect.text.length < 1) {
            errors.push("テキストを入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        await frontendCommunicator.fireEventAsync("read-tts", effect);
        return true;
    }
};

export = effect;