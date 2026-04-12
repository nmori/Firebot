"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("ttsSettings", {
            template: `
                <div>

                    <firebot-setting
                        name="TTS音声"
                        description="TTSで使用する音声です。"
                    >
                        <firebot-select
                            options="ttsVoiceOptions"
                            ng-init="ttsVoice = getSelectedVoiceName()"
                            selected="ttsVoice"
                            on-update="settings.saveSetting('DefaultTtsVoiceId', option)"
                            right-justify="true"
                            aria-label="Choose your Text to Speech voice"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="TTS音量"
                        description="TTSの読み上げ音量です。"
                    >
                        <div class="volume-slider-wrapper"  style="width: 75%">
                            <i class="fal fa-volume-down volume-low" style="font-size: 25px"></i>
                            <rzslider
                                rz-slider-model="ttsVolumeSlider.value"
                                rz-slider-options="ttsVolumeSlider.options"
                            ></rzslider>
                            <i class="fal fa-volume-up volume-high" style="font-size: 25px"></i>
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="TTS読み上げ速度"
                        description="TTSの読み上げ速度です。1が標準、0.5は半分、2は2倍です。"
                    >
                        <div class="volume-slider-wrapper" style="width: 75%">
                            <i class="fal fa-turtle volume-low" style="font-size: 25px"></i>
                            <rzslider
                                rz-slider-model="ttsRateSlider.value"
                                rz-slider-options="ttsRateSlider.options"
                            >
                            </rzslider>
                            <i class="fal fa-rabbit-fast volume-high" style="font-size: 25px"></i>
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="TTSテスト"
                        description="現在のTTS設定をテストします。"
                    >
                        <firebot-button
                            text="テストメッセージを再生"
                            ng-click="testTTS()"
                        />
                    </firebot-setting>

                </div>
          `,
            controller: function($scope, settingsService, ttsService, accountAccess, $timeout) {
                $scope.settings = settingsService;

                $scope.getSelectedVoiceName = () => {
                    const selectedVoiceId = settingsService.getSetting("DefaultTtsVoiceId");
                    const voice = ttsService.getVoiceById(selectedVoiceId);
                    return voice ? voice.name : "不明な音声";
                };

                $scope.ttsVoices = ttsService.getVoices();

                $scope.getSelectedVoiceName = () => {
                    const selectedVoiceId = settingsService.getSetting("DefaultTtsVoiceId");
                    const voice = ttsService.getVoiceById(selectedVoiceId);
                    return voice ? voice.name : "不明な音声";
                };

                $scope.ttsVoiceOptions = ttsService.getVoices().reduce((acc, v) => {
                    acc[v.id] = v.name;
                    return acc;
                }, {});

                $scope.ttsVolumeSlider = {
                    value: settingsService.getSetting("TtsVoiceVolume"),
                    options: {
                        floor: 0,
                        ceil: 1,
                        step: 0.1,
                        precision: 1,
                        ariaLabel: "Text to speech volume ",
                        translate: function(value) {
                            return Math.floor(value * 10);
                        },
                        onChange: (_, value) => {
                            settingsService.saveSetting("TtsVoiceVolume", value);
                        }
                    }
                };

                $scope.ttsRateSlider = {
                    value: settingsService.getSetting("TtsVoiceRate"),
                    options: {
                        floor: 0.1,
                        ceil: 10,
                        step: 0.1,
                        precision: 1,
                        ariaLabel: "Text to speech rate ",
                        onChange: (_, value) => {
                            settingsService.saveSetting("TtsVoiceRate", value);
                        }
                    }
                };

                const streamerName = accountAccess.accounts.streamer.username;

                const testTTSMessages = [
                    "良い一日を過ごせますように。",
                    "こうして話せるのは素敵ですね。",
                    "あなたはとても素晴らしいです。",
                    "歯医者さんにはいつ行きますか？",
                    "これはテストメッセージです。",
                    `${streamerName}さん、申し訳ありませんがそれはできません。`
                ];

                $scope.testTTS = async () => {
                    await ttsService.readText(testTTSMessages[Math.floor(Math.random() * testTTSMessages.length)], "default", false);
                };

                $scope.refreshSliders = function() {
                    $timeout(function() {
                        $scope.$broadcast('rzSliderForceRender');
                    });
                };
            }
        });
}());
