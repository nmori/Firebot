"use strict";

(function() {
    angular.module("firebotApp")
        .component("chatSettingsModal", {
            template: `
                <div class="modal-header sticky-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">チャット設定</h4>
                </div>
                <div class="modal-body p-0">
                    <!-- Main Chat Settings -->
                    <div class="chat-settings-header">メイン設定</div>
                    <div class="mt-4 mb-8 px-8">
                        <chat-settings-toggle
                            setting="settings.getShowChatViewerList()"
                            title="チャットユーザーリストの表示"
                            input-id="chatUserList"
                            on-update="settings.setShowChatViewerList(setting)"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.showActivityFeed()"
                            title="アクティビティフィードの表示"
                            input-id="activityFeed"
                            on-update="settings.setShowActivityFeed(setting)"
                        ></chat-settings-toggle>
                    </div>


                    <!-- Sound Settings -->
                    <div class="chat-settings-header">サウンド設定</div>
                    <div class="mt-4 mb-8 px-8">
                        <div class="mb-2" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                            <div class="font-black">タグ通知音</div>
                            <div>
                                <span class="btn-group" uib-dropdown>
                                    <button type="button" class="btn btn-primary" uib-dropdown-toggle>
                                        {{selectedNotificationSound.name}} <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu" uib-dropdown-menu role="menu">
                                        <li role="none" ng-repeat="n in notificationOptions">
                                            <a href role="menuitem" ng-click="selectNotification(n)">{{n.name}}</a>
                                        </li>
                                    </ul>
                                </span>
                                <span class="clickable pl-2 text-3xl" ng-click="playNotification()" style="color: #1f849e;" aria-label="Play notification">
                                    <i class="fas fa-play-circle"></i>
                                </span>
                            </div>
                        </div>
                        <file-chooser ng-show="selectedNotificationSound.name === 'Custom'"
                            model="selectedNotificationSound.path"
                            options="{title: 'Select Sound File', filters: [{name: 'Audio', extensions: ['mp3', 'ogg', 'wav', 'flac']}]}"
                            on-update="setCustomNotiPath(filepath)"></file-chooser>
                        <div class="volume-slider-wrapper" ng-hide="selectedNotificationSound.name === 'None'">
                            <i class="fal fa-volume-down volume-low pb-2 text-4xl"></i>
                            <rzslider rz-slider-model="notificationVolume" rz-slider-options="sliderOptions"></rzslider>
                            <i class="fal fa-volume-up volume-high pb-2 text-4xl"></i>
                        </div>
                    </div>

                    <!-- Display Style Settings -->
                    <div class="chat-settings-header">表示設定</div>
                    <div class="mt-4 mb-8 px-8">
                        <div class="mb-2" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                            <div class="font-black controls-fb-inline">表示スタイル</div>
                            <div class="permission-type controls-fb-inline">
                                <label class="control-fb control--radio">モダン
                                <input type="radio" ng-model="compactMode" ng-value="false" ng-click="toggleCompactMode()"/>
                                <div class="control__indicator"></div>
                                </label>
                                <label class="control-fb control--radio">コンパクト
                                    <input type="radio" ng-model="compactMode" ng-value="true" ng-click="toggleCompactMode()"/>
                                    <div class="control__indicator"></div>
                                </label>
                            </div>
                        </div>

                        <chat-settings-toggle
                            setting="settings.chatAlternateBackgrounds()"
                            title="代替の背景"
                            input-id="alternateBackgrounds"
                            on-update="settings.setChatAlternateBackgrounds(setting)"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.getShowAvatars()"
                            title="アバターを表示"
                            input-id="showAvatars"
                            on-update="settings.setShowAvatars(setting)"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.getShowTimestamps()"
                            title="タイムスタンプの表示"
                            input-id="showTimestamps"
                            on-update="settings.setShowTimestamps(setting)"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.getShowPronouns()"
                            title="代名詞を表示"
                            external-link="https://pronouns.alejo.io/"
                            input-id="showPronouns"
                            on-update="settings.setShowPronouns(setting)"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.getChatCustomFontSizeEnabled()"
                            title="カスタムフォントサイズを表示"
                            input-id="showCustomFontSize"
                            on-update="toggleCustomFontEnabled()"
                        ></chat-settings-toggle>

                        <div class="volume-slider-wrapper" ng-show="settings.getChatCustomFontSizeEnabled()">
                            <rzslider rz-slider-model="customFontSize" rz-slider-options="fontSliderOptions"></rzslider>
                        </div>
                    </div>

                    <!-- Emote Settings -->
                    <div class="chat-settings-header">エモート設定</div>
                    <div class="mt-4 mb-8 px-8">
                        <chat-settings-toggle
                            setting="settings.getShowBttvEmotes()"
                            title="Show BTTV Emotes"
                            external-link="https://betterttv.com/"
                            input-id="bttvEmotes"
                            on-update="setShowThirdPartyEmotes('bttv')"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.getShowFfzEmotes()"
                            title="FFZエモートを表示"
                            external-link="https://frankerfacez.com/"
                            input-id="ffzEmotes"
                            on-update="setShowThirdPartyEmotes('ffz')"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.getShowSevenTvEmotes()"
                            title="7TVモートを表示"
                            external-link="https://7tv.app/"
                            input-id="sevenTvEmotes"
                            on-update="setShowThirdPartyEmotes('7tv')"
                        ></chat-settings-toggle>
                    </div>

                    <!-- Filter Settings -->
                    <div class="chat-settings-header">フィルタ設定</div>
                    <div class="mt-4 mb-8 px-8">
                        <div class="mb-2" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                            <div class="font-black" id="showCustomFontSize">チャットフィードを消す</div>
                            <dropdown-select
                                options="clearChatFeedOptions"
                                selected="chatFeedMode"
                                on-update="setChatFeedMode(option)"
                            ></dropdown-select>
                        </div>

                        <chat-settings-toggle
                            setting="settings.chatHideDeletedMessages()"
                            title="削除したメッセージを隠す"
                            tooltip="'これをオンにすると、削除されたメッセージが隠され、メッセージの上にカーソルを置いたときのみ表示されます。MODがネタバレを隠すのに最適です！'"
                            input-id="hideDeletedMessages"
                            on-update="settings.setChatHideDeletedMessages(setting)"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.chatHideBotAccountMessages()"
                            title="BOTアカウントのメッセージを隠す"
                            input-id="hideBotMessages"
                            on-update="settings.setChatHideBotAccountMessages(setting)"
                        ></chat-settings-toggle>

                        <chat-settings-toggle
                            setting="settings.getChatHideWhispers()"
                            title="ささやきを隠す"
                            input-id="chatHideWhispers"
                            on-update="settings.setChatHideWhispers(setting)"
                        ></chat-settings-toggle>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">Close</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($scope, $rootScope, $timeout, settingsService, soundService, chatMessagesService) {
                const $ctrl = this;

                $scope.settings = settingsService;

                $scope.clearChatFeedOptions = {
                    never: "なし",
                    onlyStreamer: "私が/clearを実行したときのみ",
                    always: "/clearを実行したとき"
                };
                $scope.chatFeedMode = settingsService.getClearChatFeedMode();
                $scope.setChatFeedMode = mode => settingsService.setClearChatFeedMode(mode);

                $scope.compactMode = settingsService.isChatCompactMode();
                $scope.toggleCompactMode = function() {
                    $scope.compactMode = !$scope.compactMode;
                    settingsService.setChatCompactMode($scope.compactMode);
                };

                $scope.playNotification = function() {
                    soundService.playChatNotification();
                };

                $scope.selectedNotificationSound = settingsService.getTaggedNotificationSound();

                $scope.notificationVolume = settingsService.getTaggedNotificationVolume();

                $scope.volumeUpdated = function() {
                    settingsService.setTaggedNotificationVolume($scope.notificationVolume);
                };

                $scope.sliderOptions = {
                    floor: 1,
                    ceil: 10,
                    hideLimitLabels: true,
                    onChange: $scope.volumeUpdated
                };

                $scope.notificationOptions = soundService.notificationSoundOptions;

                $scope.selectNotification = function(n) {
                    $scope.selectedNotificationSound = n;
                    $scope.saveSelectedNotification();
                };

                $scope.setCustomNotiPath = function(filepath) {
                    $scope.selectedNotificationSound.path = filepath;
                    $scope.saveSelectedNotification();
                };

                $scope.saveSelectedNotification = function() {
                    const sound = $scope.selectedNotificationSound;

                    $timeout(() => {
                        $rootScope.$broadcast("rzSliderForceRender");
                    }, 50);

                    settingsService.setTaggedNotificationSound({
                        name: sound.name,
                        path: sound.name === "Custom" ? sound.path : undefined
                    });
                };

                $scope.setShowThirdPartyEmotes = (party) => {
                    switch (party) {
                        case "bttv":
                            settingsService.setShowBttvEmotes(!settingsService.getShowBttvEmotes());
                            break;
                        case "ffz":
                            settingsService.setShowFfzEmotes(!settingsService.getShowFfzEmotes());
                            break;
                        case "7tv":
                            settingsService.setShowSevenTvEmotes(!settingsService.getShowSevenTvEmotes());
                    }

                    chatMessagesService.refreshEmotes();
                };

                $scope.toggleCustomFontEnabled = () => {
                    settingsService.setChatCustomFontSizeEnabled(!settingsService.getChatCustomFontSizeEnabled());
                    $timeout(() => {
                        $rootScope.$broadcast("rzSliderForceRender");
                    }, 50);
                };

                $scope.customFontSize = settingsService.getChatCustomFontSize();
                $scope.fontSizeUpdated = function() {
                    settingsService.setChatCustomFontSize($scope.customFontSize);
                };
                $scope.fontSliderOptions = {
                    floor: 10,
                    ceil: 30,
                    translate: value => `${value}px`,
                    onChange: $scope.fontSizeUpdated
                };

                $ctrl.$onInit = () => {
                    $timeout(() => {
                        $rootScope.$broadcast("rzSliderForceRender");
                    }, 100);
                };
            }
        });
}());
