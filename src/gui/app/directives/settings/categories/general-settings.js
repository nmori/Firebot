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
                            aria-label="トレイに最小化。最小化時にタスクバーではなくトレイへ格納します"
                            accessibility-label="(settings.getSetting('MinimizeToTray') ? '有効' : '無効') + ' 最小化時にタスクバーではなくトレイへ格納します'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="起動時に接続"
                        description="Firebot起動時に Twitch やその他サービスへ自動接続します"
                    >
                        <setting-description-addon>
                            <strong>注記:</strong> この設定を有効にすると、<strong>Firebot Started</strong> イベントに設定した <strong>Toggle Connection</strong> エフェクトと競合する可能性があります。有効化後はそれらのエフェクトを無効化または削除してください。
                        </setting-description-addon>
                        <toggle-button
                            toggle-model="settings.getSetting('ConnectOnLaunch')"
                            on-toggle="settings.saveSetting('ConnectOnLaunch', !settings.getSetting('ConnectOnLaunch'))"
                            font-size="40"
                            aria-label="起動時に接続。Firebot起動時に Twitch やその他サービスへ自動接続します"
                            accessibility-label="(settings.getSetting('ConnectOnLaunch') ? '有効' : '無効') + ' Firebot起動時に Twitch やその他サービスへ自動接続します'"
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
                            aria-label="接続サウンド。Firebotの接続/切断時にサウンド通知します"
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
                                aria-label="サウンド出力デバイスを選択 {{settings.getSetting('AudioOutputDevice').label}}"
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
                            aria-label="配信中に Firebot のサイトへ配信情報を掲載します"
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
                                    aria-label="配信時間"
                                />
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--checkbox"
                                >視聴者数
                                <input
                                    type="checkbox"
                                    ng-click="settings.saveSetting('ShowViewerCountStat', !settings.getSetting('ShowViewerCountStat'))"
                                    ng-checked="settings.getSetting('ShowViewerCountStat')"
                                    aria-label="視聴者数"
                                />
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--checkbox"
                                >ハイプトレイン
                                <input
                                    type="checkbox"
                                    ng-click="settings.saveSetting('ShowHypeTrainIndicator', !settings.getSetting('ShowHypeTrainIndicator'))"
                                    ng-checked="settings.getSetting('ShowHypeTrainIndicator')"
                                    aria-label="ハイプトレイン"
                                />
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--checkbox"
                                >広告ブレイク
                                <input
                                    type="checkbox"
                                    ng-click="settings.saveSetting('ShowAdBreakIndicator', !settings.getSetting('ShowAdBreakIndicator'))"
                                    ng-checked="settings.getSetting('ShowAdBreakIndicator')"
                                    aria-label="広告ブレイク"
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

                    <firebot-setting
                        name="既定の特典タブ"
                        description="「パワーアップと特典」ページを開いたときに最初に表示するタブを設定します。"
                    >
                        <firebot-select
                            options="{ powerups: 'パワーアップ', rewards: 'チャンネル特典', queue: 'リクエストキュー' }"
                            ng-init="defaultRewardTab = settings.getSetting('DefaultRewardTab')"
                            selected="defaultRewardTab"
                            on-update="settings.saveSetting('DefaultRewardTab', option)"
                            right-justify="true"
                            aria-label="「パワーアップと特典」ページを開いたときに最初に表示するタブを設定します"
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
