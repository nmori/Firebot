"use strict";

(function () {
    angular.module("firebotApp").component("generalSettings", {
        template: `
                <div>
                    <firebot-setting
                        name="Theme"
                        description="Firebotのカラーテーマをお選びください"
                    >
                        <firebot-select
                            aria-label="App Theme"
                            options="{'Light': 'Light', 'Midnight': 'Midnight', 'PurpleSky': 'Purple Sky', 'Obsidian': 'Obsidian',}"
                            ng-init="selectedTheme = settings.getSetting('Theme')"
                            selected="selectedTheme"
                            on-update="settings.saveSetting('Theme', option)"
                            right-justify="true"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="最小化時はタスクトレイに入れる"
                        description="最小化すると、タスクバーではなくトレイの中に最小化します"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('MinimizeToTray')"
                            on-toggle="settings.saveSetting('MinimizeToTray', !settings.getSetting('MinimizeToTray'))"
                            font-size="40"
                            aria-label="Minimize to Tray, When minimized, Firebot will minimize to tray instead of task bar"
                            accessibility-label="(settings.getSetting('MinimizeToTray') ? 'Enabled' : 'Disabled') + ' When minimized, Firebot will minimize to tray instead of task bar'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="接続時のサウンド"
                        description="Firebotの接続・切断を音声でお知らせします。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('SoundsEnabled') === 'On'"
                            on-toggle="settings.saveSetting('SoundsEnabled', settings.getSetting('SoundsEnabled') === 'On' ? 'Off' : 'On')"
                            font-size="40"
                            aria-label="Connection Sounds: Get audible alerts when Firebot connects or disconnects"
                            accessibility-label="(settings.getSetting('SoundsEnabled') === 'On' ? 'Enabled' : 'Disabled') + ' Get audible alerts when Firebot connects or disconnects.'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="サウンドの出力先"
                        description="アプリのサウンド（接続/切断サウンドなど）やサウンド演出を送信する出力デバイスを変更します。"
                    >
                        <div class="dropdown">
                            <button
                                class="btn btn-default dropdown-toggle"
                                type="button"
                                id="options-emulation"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="true"
                                aria-label="Choose your audio output device {{settings.getSetting('AudioOutputDevice').label}}"
                            >
                                <span class="dropdown-text">{{settings.getSetting('AudioOutputDevice').label}}</span>
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu right-justified-dropdown">
                                <li ng-repeat="device in audioOutputDevices">
                                    <a
                                        href
                                        ng-click="settings.saveSetting('AudioOutputDevice', device)"
                                    >{{device.label}}</a>
                                </li>
                                <li class="divider"></li>
                                <li
                                    role="menuitem"
                                    ng-click="settings.saveSetting('AudioOutputDevice', {label: 'Send To Overlay', deviceId: 'overlay'})"
                                >
                                    <a href>オーバーレイに送る</a>
                                </li>
                            </ul>
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="ベータ版の通知"
                        description="Firebot は自動的に安定版をダウンロードしますが、ベータ版リリースは自動更新の対象外です。
                        新しいベータ版リリースの通知を受けたい場合は有効にしてください。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('NotifyOnBeta')"
                            on-toggle="settings.saveSetting('NotifyOnBeta', !settings.getSetting('NotifyOnBeta'))"
                            font-size="40"
                            aria-label="Firebot automatically updates to new stable versions. It does not automatically update to betas or major new
                        releases however. Enable if you want to be notified of new beta releases."
                            accessibility-label="(settings.getSetting('NotifyOnBeta') ? 'Enabled' : 'Disabled') + ' Firebot automatically updates to new stable versions. It does not automatically update to betas or major new
                        releases however. Enable if you want to be notified of new beta releases.'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Firebot ホームページ上の紹介"
                        description=""
                    >

                        <setting-description-addon>
                            <div style="margin-top: 10px;">
                                この設定を有効にすると、配信を開始したときに <a
                                    class="clickable"
                                    ng-click="openLink('https://firebot.app/watch')"
                                >Firebotのウェブサイト</a> で紹介されます。
                            </div>
                        </setting-description-addon>

                        <toggle-button
                            toggle-model="settings.getSetting('WebOnlineCheckin')"
                            on-toggle="settings.saveSetting('WebOnlineCheckin', !settings.getSetting('WebOnlineCheckin'))"
                            font-size="40"
                            aria-label="Enable this setting to have your stream displayed on Firebot's website when you're live"
                            accessibility-label="(settings.getSetting('WebOnlineCheckin') ? 'Enabled' : 'Disabled') + ' Enable this setting to have your stream displayed on Firebot\\'s website when you\\'re live'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="ライブ・ストリーム"
                        description="配信時にトップバーに表示される配信統計を選択します。"
                    >
                        <div>
                            <label class="control-fb control--checkbox"
                                >配信時間
                                <input
                                    type="checkbox"
                                    ng-click="settings.saveSetting('ShowUptimeStat', !settings.getSetting('ShowUptimeStat'))"
                                    ng-checked="settings.getSetting('ShowUptimeStat')"
                                    aria-label="Uptime"
                                />
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--checkbox"
                                >視聴者数
                                <input
                                    type="checkbox"
                                    ng-click="settings.saveSetting('ShowViewerCountStat', !settings.getSetting('ShowViewerCountStat'))"
                                    ng-checked="settings.getSetting('ShowViewerCountStat')"
                                    aria-label="Viewer count"
                                />
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--checkbox"
                                >ハイプトレイン
                                <input
                                    type="checkbox"
                                    ng-click="settings.saveSetting('ShowHypeTrainIndicator', !settings.getSetting('ShowHypeTrainIndicator'))"
                                    ng-checked="settings.getSetting('ShowHypeTrainIndicator')"
                                    aria-label="Hype Trains"
                                />
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--checkbox"
                                >広告（アドブレイク）
                                <input
                                    type="checkbox"
                                    ng-click="settings.saveSetting('ShowAdBreakIndicator', !settings.getSetting('ShowAdBreakIndicator'))"
                                    ng-checked="settings.getSetting('ShowAdBreakIndicator')"
                                    aria-label="Ad Breaks"
                                />
                                <div class="control__indicator"></div>
                            </label>
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="非アクティブ視聴時間"
                        description="アクティブな視聴者が最後のチャットメッセージの後、非アクティブとして記録されるまでの時間."
                    >
                        <firebot-select
                            options="[5,10,15,20,25,30,35,40,45,50,55,60]"
                            ng-init="selectedTimeout = settings.getSetting('ActiveChatUserListTimeout')"
                            selected="selectedTimeout"
                            on-update="setActiveChatUserTimeout(option)"
                            right-justify="true"
                            aria-label="Choose your Inactive Viewer Time"
                        />
                        <span> 分</span>
                    </firebot-setting>

                    <firebot-setting
                        name="立ち上げ時にストリームのプレビューを開く"
                        description="Firebot起動時に自動的にストリームプレビューウィンドウを開きます。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('OpenStreamPreviewOnLaunch')"
                            on-toggle="settings.saveSetting('OpenStreamPreviewOnLaunch', !settings.getSetting('OpenStreamPreviewOnLaunch'))"
                            font-size="40"
                            accessibility-label="(settings.getSetting('OpenStreamPreviewOnLaunch') ? 'Enabled' : 'Disabled') + ' Stream Preview on Launch'"
                        />
                    </firebot-setting>
                </div>
          `,
        controller: function ($rootScope, $scope, soundService, settingsService, $q) {
            $scope.openLink = $rootScope.openLinkExternally;
            $scope.settings = settingsService;

            $scope.audioOutputDevices = [
                {
                    label: "システムの既定デバイス",
                    deviceId: "default"
                }
            ];

            $q.when(soundService.getOutputDevices()).then((deviceList) => {
                $scope.audioOutputDevices = $scope.audioOutputDevices.concat(deviceList);
            });

            $scope.setActiveChatUserTimeout = (value) => {
                if (value == null) {
                    value = "10";
                }
                settingsService.saveSetting("ActiveChatUserListTimeout", value);
            };
        }
    });
})();
