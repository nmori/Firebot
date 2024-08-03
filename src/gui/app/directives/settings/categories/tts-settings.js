"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("ttsSettings", {
            template: `
                <div>

                    <firebot-setting
                        name="合成音声(Text to Speech)"
                        description="使用される合成音声"
                    >
                        <firebot-select
                            options="ttsVoiceOptions"
                            ng-init="ttsVoice = getSelectedVoiceName()"
                            selected="ttsVoice"
                            on-update="settings.setDefaultTtsVoiceId(option)"
                            right-justify="true"
                            aria-label="Choose your Text to Speech voice"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="読み上げ音量"
                        description="TTSが話す音量"
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
                        name="読み上げスピード"
                        description="合成音声が話す速度： 1は通常。0.5は半分の速さ。2は2倍など。"
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
                        name="読み上げテスト"
                        description="現在の設定でテスト読み上げします"
                    >
                        <firebot-button
                            text="テストで読み上げる"
                            ng-click="testTTS()"
                        />
                    </firebot-setting>

                </div>
          `,
            controller: function($scope, settingsService, ttsService, accountAccess, $timeout) {
                $scope.settings = settingsService;

                $scope.getSelectedVoiceName = () => {
                    const selectedVoiceId = settingsService.getDefaultTtsVoiceId();
                    const voice = ttsService.getVoiceById(selectedVoiceId);
                    return voice ? voice.name : "不明な音声";
                };

                $scope.ttsVoices = ttsService.getVoices();

                $scope.getSelectedVoiceName = () => {
                    const selectedVoiceId = settingsService.getDefaultTtsVoiceId();
                    const voice = ttsService.getVoiceById(selectedVoiceId);
                    return voice ? voice.name : "不明な音声";
                };

                $scope.ttsVoiceOptions = ttsService.getVoices().reduce((acc, v) => {
                    acc[v.id] = v.name;
                    return acc;
                }, {});

                $scope.ttsVolumeSlider = {
                    value: settingsService.getTtsVoiceVolume(),
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
                            settingsService.setTtsVoiceVolume(value);
                        }
                    }
                };

                $scope.ttsRateSlider = {
                    value: settingsService.getTtsVoiceRate(),
                    options: {
                        floor: 0.1,
                        ceil: 10,
                        step: 0.1,
                        precision: 1,
                        ariaLabel: "Text to speech rate ",
                        onChange: (_, value) => {
                            settingsService.setTtsVoiceRate(value);
                        }
                    }
                };

                const streamerName = accountAccess.accounts.streamer.username;

                const testTTSMessages = [
                    "良い一日をお過ごしください。",
                    "話ができてとてもうれしい",
                    "あなたは素晴らしい",
                    "歯医者にはいつ行く？歯が痛い。ははは。",
                    "これはテストメッセージです。ピーピーピー。",
                    `ごめんね、 ${streamerName}さん。 残念ながら、それはできません。`
                ];

                $scope.testTTS = () => {
                    ttsService.readText(testTTSMessages[Math.floor(Math.random() * testTTSMessages.length)], "default");
                };

                $scope.refreshSliders = function() {
                    $timeout(function() {
                        $scope.$broadcast('rzSliderForceRender');
                    });
                };
            }
        });
}());
