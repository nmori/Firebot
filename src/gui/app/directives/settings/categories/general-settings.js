"use strict";

(function () {
    angular.module("firebotApp").component("generalSettings", {
        template: `
                <div>
                    <firebot-setting
                        name="テーマ"
                        description="Firebotのカラーテーマを選択します。"
                    >
                        <firebot-select
                            aria-label="アプリテーマ"
                            options="{'Light': 'Light', 'Midnight': 'Midnight', 'PurpleSky': 'Purple Sky', 'Obsidian': 'Obsidian',}"
                            ng-init="selectedTheme = settings.getSetting('Theme')"
                            selected="selectedTheme"
                            on-update="settings.saveSetting('Theme', option)"
                            right-justify="true"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="トレイに最小化"
                        description="最小化時にタスクバーではなくトレイへ格納します"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('MinimizeToTray')"
                            on-toggle="settings.saveSetting('MinimizeToTray', !settings.getSetting('MinimizeToTray'))"
                            font-size="40"
                            aria-label="Minimize to Tray, When minimized, Firebot will minimize to tray instead of task bar"
                            accessibility-label="(settings.getSetting('MinimizeToTray') ? '有効' : '無効') + ' 最小化時にタスクバーではなくトレイへ格納します'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="接続サウンド"
                        description="Firebotの接続/切断時にサウンド通知します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('SoundsEnabled') === 'On'"
                            on-toggle="settings.saveSetting('SoundsEnabled', settings.getSetting('SoundsEnabled') === 'On' ? 'Off' : 'On')"
                            font-size="40"
                            aria-label="Connection Sounds: Get audible alerts when Firebot connects or disconnects"
                            accessibility-label="(settings.getSetting('SoundsEnabled') === 'On' ? '有効' : '無効') + ' Firebotの接続/切断時にサウンド通知します'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="サウンド出力デバイス"
                        description="アプリ音（接続/切断音など）やサウンドエフェクトの出力先を変更します。"
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
                                    ng-click="settings.saveSetting('AudioOutputDevice', {label: 'オーバーレイに送信', deviceId: 'overlay'})"
                                >
                                    <a href>オーバーレイに送信</a>
                                </li>
                            </ul>
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="ベータ通知"
                        description="Firebot は安定版への自動更新は行いますが、ベータ版やメジャー新バージョンは自動更新しません。ベータ版の通知を受け取りたい場合に有効化してください。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('NotifyOnBeta')"
                            on-toggle="settings.saveSetting('NotifyOnBeta', !settings.getSetting('NotifyOnBeta'))"
                            font-size="40"
                            aria-label="Firebot automatically updates to new stable versions. It does not automatically update to betas or major new
                        releases however. Enable if you want to be notified of new beta releases."
                            accessibility-label="(settings.getSetting('NotifyOnBeta') ? '有効' : '無効') + ' ベータ版リリース通知を受け取ります'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Firebot.appで配信を紹介"
                        description=""
                    >

                        <setting-description-addon>
                            <div style="margin-top: 10px;">
                                この設定を有効にすると、配信中に <a
                                    class="clickable"
                                    ng-click="openLink('https://firebot.app/watch')"
                                >Firebotのウェブサイト</a> に配信が掲載されます。
                            </div>
                        </setting-description-addon>

                        <toggle-button
                            toggle-model="settings.getSetting('WebOnlineCheckin')"
                            on-toggle="settings.saveSetting('WebOnlineCheckin', !settings.getSetting('WebOnlineCheckin'))"
                            font-size="40"
                            aria-label="Enable this setting to have your stream displayed on Firebot's website when you're live"
                            accessibility-label="(settings.getSetting('WebOnlineCheckin') ? '有効' : '無効') + ' 配信中に Firebot のサイトへ配信情報を掲載します'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="配信中ステータス"
                        description="配信中に上部バーへ表示する統計情報を選択します。"
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
                                >広告ブレイク
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
                        name="非アクティブ視聴者時間"
                        description="最後のチャット後、アクティブ視聴者を非アクティブ扱いにするまでの時間です。"
                    >
                        <firebot-select
                            options="[5,10,15,20,25,30,35,40,45,50,55,60]"
                            ng-init="selectedTimeout = settings.getSetting('ActiveChatUserListTimeout')"
                            selected="selectedTimeout"
                            on-update="setActiveChatUserTimeout(option)"
                            right-justify="true"
                            aria-label="非アクティブ視聴者までの時間を選択"
                        />
                        <span> 分</span>
                    </firebot-setting>

                    <firebot-setting
                        name="起動時に配信プレビューを開く"
                        description="Firebot起動時に配信プレビューウィンドウを自動で開きます。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('OpenStreamPreviewOnLaunch')"
                            on-toggle="settings.saveSetting('OpenStreamPreviewOnLaunch', !settings.getSetting('OpenStreamPreviewOnLaunch'))"
                            font-size="40"
                            accessibility-label="(settings.getSetting('OpenStreamPreviewOnLaunch') ? '有効' : '無効') + ' 起動時に配信プレビューを開きます'"
                        />
                    </firebot-setting>
                </div>
          `,
        controller: function ($rootScope, $scope, soundService, settingsService, $q) {
            $scope.openLink = $rootScope.openLinkExternally;
            $scope.settings = settingsService;

            $scope.audioOutputDevices = [
                {
                    label: "システム既定",
                    deviceId: "default"
                }
            ];

            $q.when(soundService.getOutputDevices()).then((deviceList) => {
                $scope.audioOutputDevices = $scope.audioOutputDevices.concat(
                    deviceList.toSorted((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }))
                );
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
