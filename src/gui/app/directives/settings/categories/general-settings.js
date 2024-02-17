"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("generalSettings", {
            template: `
                <div>
                    <firebot-setting
                        name="Theme"
                        description="Firebotのカラーテーマをお選びください"
                    >
                        <firebot-select
                            options="['Light', 'Midnight', 'Obsidian']"
                            ng-init="selectedTheme = settings.getTheme()"
                            selected="selectedTheme"
                            on-update="settings.setTheme(option)"
                            right-justify="true"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="最小化時はタスクトレイに入れる"
                        description="最小化すると、タスクバーではなくトレイの中に最小化します"
                    >
                        <toggle-button
                            toggle-model="settings.getMinimizeToTray()"
                            on-toggle="settings.setMinimizeToTray(!settings.getMinimizeToTray())"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="接続時のサウンド"
                        description="Firebotの接続・切断を音声でお知らせします。"
                    >
                        <toggle-button
                            toggle-model="settings.soundsEnabled() === 'On'"
                            on-toggle="settings.setSoundsEnabled(settings.soundsEnabled() === 'On' ? 'Off' : 'On')"
                            font-size="40"
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
                            >
                                <span class="dropdown-text">{{settings.getAudioOutputDevice().label}}</span>
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu right-justified-dropdown">
                                <li ng-repeat="device in audioOutputDevices">
                                    <a
                                        href
                                        ng-click="settings.setAudioOutputDevice(device)"
                                    >{{device.label}}</a>
                                </li>
                                <li class="divider"></li>
                                <li
                                    role="menuitem"
                                    ng-click="settings.setAudioOutputDevice({label: 'Send To Overlay', deviceId: 'overlay'})"
                                >
                                    <a href>オーバーレイに送る</a>
                                </li>
                            </ul>
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="Beta Notifications"
                        description="Firebot automatically updates to new stable versions. It does not automatically update to betas or major new
                        releases however. Enable if you want to be notified of new beta releases."
                    >
                        <toggle-button
                            toggle-model="settings.notifyOnBeta()"
                            on-toggle="settings.setNotifyOnBeta(!settings.notifyOnBeta())"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Feature My Stream on Firebot.app"
                        description="Enable this setting to have your stream displayed on Firebot's website when you're live"
                    >
                        <toggle-button
                            toggle-model="settings.getWebOnlineCheckin()"
                            on-toggle="settings.setWebOnlineCheckin(!settings.getWebOnlineCheckin())"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Live Stream Stats"
                        description="Select which stream stats show in the top bar when live."
                    >
                        <div>
                            <label class="control-fb control--checkbox"
                                >配信時間
                                <input
                                    type="checkbox"
                                    ng-click="settings.setShowUptimeStat(!settings.getShowUptimeStat())"
                                    ng-checked="settings.getShowUptimeStat()"
                                    aria-label="..."
                                />
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--checkbox"
                                >視聴者数
                                <input
                                    type="checkbox"
                                    ng-click="settings.setShowViewerCountStat(!settings.getShowViewerCountStat())"
                                    ng-checked="settings.getShowViewerCountStat()"
                                    aria-label="..."
                                />
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--checkbox"
                                >Hype Trains
                                <input
                                    type="checkbox"
                                    ng-click="settings.setShowHypeTrainIndicator(!settings.getShowHypeTrainIndicator())"
                                    ng-checked="settings.getShowHypeTrainIndicator()"
                                    aria-label="..."
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
                            ng-init="selectedTimeout = settings.getActiveChatUserListTimeout()"
                            selected="selectedTimeout"
                            on-update="setActiveChatUserTimeout(option)"
                            right-justify="true"
                        />
                        <span> 分</span>
                    </firebot-setting>

                    <firebot-setting
                        name="Open Stream Preview on Launch"
                        description="Automatically open the Stream Preview window when Firebot launches."
                    >
                        <toggle-button
                            toggle-model="settings.getOpenStreamPreviewOnLaunch()"
                            on-toggle="settings.setOpenStreamPreviewOnLaunch(!settings.getOpenStreamPreviewOnLaunch())"
                            font-size="40"
                            accessibility-label="(settings.getOpenStreamPreviewOnLaunch() ? 'Disable' : 'Enable') + ' Stream Preview on Launch'"
                        />
                    </firebot-setting>
                </div>
          `,
            controller: function($scope, settingsService, $q) {
                $scope.settings = settingsService;

                $scope.audioOutputDevices = [{
                    label: "システムの既定デバイス",
                    deviceId: "default"
                }];

                $q
                    .when(navigator.mediaDevices.enumerateDevices())
                    .then((deviceList) => {
                        deviceList = deviceList
                            .filter(
                                d =>
                                    d.kind === "audiooutput" &&
                                d.deviceId !== "communications" &&
                                d.deviceId !== "default"
                            )
                            .map((d) => {
                                return { label: d.label, deviceId: d.deviceId };
                            });

                        $scope.audioOutputDevices = $scope.audioOutputDevices.concat(
                            deviceList
                        );
                    });

                $scope.setActiveChatUserTimeout = (value) => {
                    if (value == null) {
                        value = "10";
                    }
                    settingsService.setActiveChatUserListTimeout(value);
                    ipcRenderer.send('setActiveChatUserTimeout', value);
                };
            }
        });
}());
