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
        name: "テキスト読み上げ",
        description: "Firebot に TTS でテキストを読み上げさせます。",
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
                placeholder="音声を選択または検索…"
            />
        </eos-container>

        <eos-container header="待機" pad-top="true">
            <firebot-checkbox
                label="音声が終わるまで待つ"
                tooltip="音声が終了またはキャンセルされるまで、次のエフェクトの実行を待ちます。"
                model="effect.wait"
                style="margin: 0px 15px 0px 0px"
            />
        </eos-container>

        <eos-container header="音量" pad-top="true">
            <div class="muted">
                <p style="margin-bottom: 5px;">読み上げの音量は全体設定でのみ変更できます。</p>
                <p><span class="font-bold">設定 → TTS</span> から音量を調整してください。</p>
            </div>
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
                name: "デフォルト",
                description: "設定 > TTS で指定されたデフォルトの音声"
            },
            ...ttsService.getVoices() as TtsVoice[]
        ] as TtsVoice[];


        $scope.getSelectedVoiceName = () => {
            const voiceId = $scope.effect.voiceId;
            if (voiceId === "default" || voiceId == null) {
                return "デフォルト";
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