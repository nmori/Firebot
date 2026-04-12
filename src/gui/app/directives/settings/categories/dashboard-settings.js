"use strict";

(function () {

    angular
        .module("firebotApp")
        .component("dashboardSettings", {
            template: `
                <div>
                    <firebot-setting-category
                        name="全般"
                    />

                    <firebot-setting
                        name="チャット視聴者リストを表示"
                        description="チャットに接続している視聴者一覧の表示/非表示を切り替えます。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ShowChatViewerList')"
                            on-toggle="settings.saveSetting('ShowChatViewerList', !settings.getSetting('ShowChatViewerList'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="アクティビティフィードを表示"
                        description="Firebot 起動後に発生したイベントを表示するアクティビティフィードの表示/非表示を切り替えます。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ShowActivityFeed')"
                            on-toggle="settings.saveSetting('ShowActivityFeed', !settings.getSetting('ShowActivityFeed'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting-category
                        name="クイックアクション"
                        pad-top="true"
                    />

                    <firebot-setting
                        name="クイックアクションを編集"
                        description="ダッシュボードのクイックアクションを編集・並べ替えします。"
                    >
                        <firebot-button
                            text="クイックアクションを編集"
                            ng-click="quickActionsService.openQuickActionSettingsModal()"
                        />
                    </firebot-setting>

                    <firebot-setting-category
                        name="アクティビティフィード"
                        pad-top="true"
                    />

                    <firebot-setting
                        name="表示イベント"
                        description="アクティビティフィードに表示するイベントを選択します。"
                    >
                        <firebot-button
                            text="イベントを編集"
                            ng-click="activityFeed.showEditActivityFeedEventsModal()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="アクティビティイベントをチャットにも表示"
                        description="有効時、アクティビティフィードに表示されるイベントをチャットフィードにもアラート表示します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ShowActivityFeedEventsInChat')"
                            on-toggle="settings.saveSetting('ShowActivityFeedEventsInChat', !settings.getSetting('ShowActivityFeedEventsInChat'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting-category
                        name="サウンド"
                        pad-top="true"
                    />

                    <firebot-setting
                        name="メンション通知音"
                        description="チャットでメンションされたときに再生される通知音です。"
                    >
                        <div style="width: 80%; text-align: right;">
                            <div>
                                <span class="btn-group" uib-dropdown>
                                    <button type="button" class="btn btn-default" uib-dropdown-toggle>
                                        {{selectedNotificationSound.name}} <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu" uib-dropdown-menu role="menu">
                                        <li role="none" ng-repeat="n in notificationSoundOptions">
                                            <a href role="menuitem" ng-click="selectNotification(n)">{{n.name}}</a>
                                        </li>
                                    </ul>
                                </span>
                                <span class="clickable pl-2 text-3xl" ng-click="sounds.playChatNotification()" style="color: #1f849e;" aria-label="Play notification sound">
                                    <i class="fas fa-play-circle"></i>
                                </span>
                            </div>
                            <div class="mt-4" ng-show="selectedNotificationSound.name === 'Custom'">
                                <file-chooser
                                    model="selectedNotificationSound.path"
                                    options="{title: '音声ファイルを選択', filters: [{name: 'Audio', extensions: ['mp3', 'ogg', 'oga', 'wav', 'flac']}]}"
                                    on-update="setCustomNotiPath(filepath)"
                                />
                            </div>
                            <div class="volume-slider-wrapper mt-4" ng-hide="selectedNotificationSound.name === 'None'">
                                <i class="fal fa-volume-down volume-low pb-2 text-4xl"></i>
                                <rzslider rz-slider-model="notificationVolume" rz-slider-options="volumeSliderOptions" />
                                <i class="fal fa-volume-up volume-high pb-2 text-4xl"></i>
                            </div>
                        </div>
                    </firebot-setting>

                    <firebot-setting-category
                        name="チャット表示"
                        pad-top="true"
                    />

                    <firebot-setting
                        name="メッセージ表示スタイル"
                        description="チャットフィードでのメッセージ表示方法を設定します。"
                    >
                        <firebot-select
                            options="{ true: 'コンパクト', false: 'モダン（展開）' }"
                            ng-init="compactMode = settings.getSetting('ChatCompactMode')"
                            selected="compactMode"
                            on-update="settings.saveSetting('ChatCompactMode', option === 'true')"
                            right-justify="true"
                            aria-label="チャットメッセージの表示スタイルをコンパクトまたはモダン（展開）に設定"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="交互背景"
                        description="各チャットメッセージの背景を交互にして見分けやすくします。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatAlternateBackgrounds')"
                            on-toggle="settings.saveSetting('ChatAlternateBackgrounds', !settings.getSetting('ChatAlternateBackgrounds'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="共有チャット情報を表示"
                        description="共有チャット中にメッセージが送信されたチャンネル情報をチャットフィードに表示します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatShowSharedChatInfo')"
                            on-toggle="settings.saveSetting('ChatShowSharedChatInfo', !settings.getSetting('ChatShowSharedChatInfo'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="アバターを表示"
                        description="チャットフィードの各メッセージに発言者のアバターを表示します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatAvatars')"
                            on-toggle="settings.saveSetting('ChatAvatars', !settings.getSetting('ChatAvatars'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="タイムスタンプを表示"
                        description="チャットフィードのメッセージに時刻を表示します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatTimestamps')"
                            on-toggle="settings.saveSetting('ChatTimestamps', !settings.getSetting('ChatTimestamps'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="代名詞を表示"
                        description="チャットフィードで発言者の代名詞を表示します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatPronouns')"
                            on-toggle="settings.saveSetting('ChatPronouns', !settings.getSetting('ChatPronouns'))"
                            font-size="40"
                        />

                        <setting-description-addon>
                            <strong>代名詞情報はサードパーティーサービス <a href="https://pr.alejo.io/">Twitch Chat Pronouns</a> により提供されます。</strong>
                        </setting-description-addon>
                    </firebot-setting>

                    <firebot-setting
                        name="チャット順序を反転"
                        description="有効時、新しいチャットメッセージが下ではなく上に表示されます。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatReverseOrder')"
                            on-toggle="settings.saveSetting('ChatReverseOrder', !settings.getSetting('ChatReverseOrder'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="カスタムフォント（種類）を使用"
                        description="チャットフィードでカスタムフォントファミリーを使用します。"
                    >
                        <div style="text-align: right">
                            <toggle-button
                                toggle-model="settings.getSetting('ChatCustomFontFamilyEnabled')"
                                on-toggle="settings.saveSetting('ChatCustomFontFamilyEnabled', !settings.getSetting('ChatCustomFontFamilyEnabled'))"
                                font-size="40"
                            />

                            <firebot-font-select
                                ng-show="settings.getSetting('ChatCustomFontFamilyEnabled')"
                                ng-model="chatFontSettings.family"
                                on-select="settings.saveSetting('ChatCustomFontFamily', chatFontSettings.family)"
                            />
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="カスタムフォント（サイズ）を使用"
                        description="チャットフィードでカスタムフォントサイズを使用します。"
                    >
                        <div style="text-align: right">
                            <toggle-button
                                toggle-model="settings.getSetting('ChatCustomFontSizeEnabled')"
                                on-toggle="settings.saveSetting('ChatCustomFontSizeEnabled', !settings.getSetting('ChatCustomFontSizeEnabled'))"
                                font-size="40"
                            />

                            <firebot-input
                                class="mt-4"
                                ng-show="settings.getSetting('ChatCustomFontSizeEnabled')"
                                input-type="number"
                                placeholder="数値を入力"
                                model="chatFontSettings.size"
                                on-input-update="settings.saveSetting('ChatCustomFontSize', chatFontSettings.size)"
                                disable-variables="true"
                            />
                        </div>
                    </firebot-setting>

                    <firebot-setting-category
                        name="エモート"
                        pad-top="true"
                    />

                    <firebot-setting
                        name="利用可能な Twitch エモートをすべて読み込む"
                        description="配信者アカウント/ボットアカウントで使える Twitch エモートをすべてチャット補完リストに追加します（サブスク、フォロワー、Bits ティア等を含む）。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatGetAllEmotes')"
                            on-toggle="settings.saveSetting('ChatGetAllEmotes', !settings.getSetting('ChatGetAllEmotes'))"
                            font-size="40"
                        />

                        <setting-description-addon>
                            <strong>注: チャット接続後、エモートの読み込みに数秒かかる場合があります。この設定変更は次回チャット接続時に反映されます。</strong>
                        </setting-description-addon>
                    </firebot-setting>

                    <firebot-setting
                        name="サードパーティーエモート"
                        description="ここで有効にしたサービスからサードパーティーエモートを読み込みます。"
                    >
                        <div>
                            <firebot-checkbox
                                model="thirdPartyEmoteProviders.bttv"
                                label="BTTV"
                                external-link="https://betterttv.com/"
                                ng-click="setShowThirdPartyEmotes('bttv')"
                            />

                            <firebot-checkbox
                                model="thirdPartyEmoteProviders.ffz"
                                label="FFZ"
                                external-link="https://frankerfacez.com/"
                                ng-click="setShowThirdPartyEmotes('ffz')"
                            />

                            <firebot-checkbox
                                model="thirdPartyEmoteProviders.seventv"
                                label="7TV"
                                external-link="https://7tv.app/"
                                ng-click="setShowThirdPartyEmotes('seventv')"
                            />
                        </div>
                    </firebot-setting>

                    <firebot-setting-category
                        name="フィルタリング"
                        pad-top="true"
                    />

                    <firebot-setting
                        name="チャットクリア動作"
                        description="Twitchチャットのクリア時に Firebot 側チャットをどうクリアするかを設定します。"
                    >
                        <firebot-select
                            ng-init="clearChatFeedMode = settings.getSetting('ClearChatFeedMode')"
                            options="clearChatFeedOptions"
                            selected="clearChatFeedMode"
                            on-update="settings.saveSetting('ClearChatFeedMode', option)"
                            aria-label="Determines how clearing Twitch chat also clears Firebot chat."
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="削除メッセージを隠す"
                        description="有効時、削除されたメッセージを黒塗り表示します。ホバーで内容を確認できます。ネタバレ防止に便利です。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatHideDeletedMessages')"
                            on-toggle="settings.saveSetting('ChatHideDeletedMessages', !settings.getSetting('ChatHideDeletedMessages'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="ボットアカウントのメッセージを隠す"
                        description="チャットフィードでボットアカウント送信メッセージを非表示にします（ボットログインが必要）。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatHideBotAccountMessages')"
                            on-toggle="settings.saveSetting('ChatHideBotAccountMessages', !settings.getSetting('ChatHideBotAccountMessages'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Whisper を隠す"
                        description="受信した Whisper（プライベートメッセージ）をチャットフィードで非表示にします。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ChatHideWhispers')"
                            on-toggle="settings.saveSetting('ChatHideWhispers', !settings.getSetting('ChatHideWhispers'))"
                            font-size="40"
                        />
                    </firebot-setting>
                </div>
          `,
            controller: function (
                $scope,
                $timeout,
                $rootScope,
                settingsService,
                soundService,
                chatMessagesService,
                activityFeedService,
                quickActionsService
            ) {
                const $ctrl = this;
                $scope.settings = settingsService;
                $scope.sounds = soundService;
                $scope.activityFeed = activityFeedService;
                $scope.quickActionsService = quickActionsService;

                $scope.selectedNotificationSound = settingsService.getSetting("ChatTaggedNotificationSound");
                $scope.notificationVolume = settingsService.getSetting("ChatTaggedNotificationVolume");
                $scope.notificationSoundOptions = soundService.notificationSoundOptions;

                $scope.volumeSliderOptions = {
                    floor: 1,
                    ceil: 10,
                    hideLimitLabels: true,
                    onChange: (_, value) => {
                        settingsService.saveSetting("ChatTaggedNotificationVolume", value);
                    }
                };

                function refreshSlider() {
                    $timeout(function() {
                        $scope.$broadcast("rzSliderForceRender");
                    }, 50);
                }

                $ctrl.$onInit = refreshSlider;

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

                    refreshSlider();

                    settingsService.saveSetting("ChatTaggedNotificationSound", {
                        name: sound.name,
                        path: sound.name === "Custom" ? sound.path : undefined
                    });
                };

                $scope.chatFontSettings = {
                    family: settingsService.getSetting("ChatCustomFontFamily"),
                    size: settingsService.getSetting("ChatCustomFontSize")
                };

                $scope.thirdPartyEmoteProviders = {
                    bttv: settingsService.getSetting("ChatShowBttvEmotes"),
                    ffz: settingsService.getSetting("ChatShowFfzEmotes"),
                    seventv: settingsService.getSetting("ChatShowSevenTvEmotes")
                };

                $scope.setShowThirdPartyEmotes = (service) => {
                    switch (service) {
                        case "bttv":
                            settingsService.saveSetting("ChatShowBttvEmotes", $scope.thirdPartyEmoteProviders.bttv);
                            break;
                        case "ffz":
                            settingsService.saveSetting("ChatShowFfzEmotes", $scope.thirdPartyEmoteProviders.ffz);
                            break;
                        case "seventv":
                            settingsService.saveSetting("ChatShowSevenTvEmotes", $scope.thirdPartyEmoteProviders.seventv);
                            break;
                    }

                    chatMessagesService.refreshEmotes();
                };

                $scope.clearChatFeedOptions = {
                    never: "クリアしない",
                    onlyStreamer: "自分が /clear したときのみ",
                    always: "自分またはモデレーターが /clear したとき"
                };

                $scope.quickActionSettings = settingsService.getSetting("QuickActions");
            }
        });
}());