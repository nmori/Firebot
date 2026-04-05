"use strict";

(function () {

    angular
        .module("firebotApp")
        .component("triggerSettings", {
            template: `
                <div>
                    <firebot-setting-category
                        name="コマンド"
                    />
                    <firebot-setting
                        name="新規コマンドのデフォルトモード"
                        description="新しいコマンドを作成するときの既定モードです（シンプル/高度）。"
                    >
                        <firebot-select
                            options="{ true: '高度', false: 'シンプル' }"
                            ng-init="selectedCmdMode = settings.getSetting('DefaultToAdvancedCommandMode')"
                            selected="selectedCmdMode"
                            on-update="settings.saveSetting('DefaultToAdvancedCommandMode', option === 'true')"
                            right-justify="true"
                            aria-label="新規コマンドのデフォルトモードを選択"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="配信者アカウントはクールダウンを無視"
                        description="有効時、配信者アカウントはクールダウン中のコマンドも実行できます。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('StreamerExemptFromCooldowns')"
                            on-toggle="settings.saveSetting('StreamerExemptFromCooldowns', !settings.getSetting('StreamerExemptFromCooldowns'))"
                            font-size="40"
                            aria-label="配信者アカウントのクールダウン免除"
                            accessibility-label="(settings.getSetting('StreamerExemptFromCooldowns') ? '有効' : '無効') + ' 有効時、配信者アカウントはクールダウン中のコマンドも実行できます'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="共有チャットでコマンド実行を許可"
                        description="Twitch 共有チャット（Shared Chat）中に他チャンネルで送信されたメッセージでもコマンドを実行できるようにします。"
                    >
                        <firebot-select
                            options="{ true: 'はい', false: 'いいえ' }"
                            ng-init="allowSharedChatCommands = settings.getSetting('AllowCommandsInSharedChat')"
                            selected="allowSharedChatCommands"
                            on-update="settings.saveSetting('AllowCommandsInSharedChat', option === 'true')"
                            right-justify="true"
                            aria-label="共有チャットでコマンド実行を許可"
                        />
                    </firebot-setting>

                    <firebot-setting-category
                        name="イベント"
                        pad-top="true"
                    />
                    <firebot-setting
                        name="関連するギフトサブイベントを無視"
                        description="有効時、コミュニティギフトサブに含まれる個別のギフトサブ（Gift Sub）イベントを無視します。コミュニティサブイベントのみが発火し、受取人ごとの追加ギフトサブイベントは発火しません。"
                    >
                        <firebot-select
                            options="{ true: 'はい', false: 'いいえ' }"
                            ng-init="ignoreSubEvents = settings.getSetting('IgnoreSubsequentSubEventsAfterCommunitySub')"
                            selected="ignoreSubEvents"
                            on-update="settings.saveSetting('IgnoreSubsequentSubEventsAfterCommunitySub', option === 'true')"
                            right-justify="true"
                            aria-label="関連するギフトサブイベントを無視するか設定"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="予定広告ブレイク事前通知トリガー"
                            description="次の予定広告ブレイクの何分前に「予定広告ブレイク開始間近」イベントを発火するか設定します。無効化も可能です。Twitch 広告マネージャー（Ads Manager）の設定により、配信開始直後は設定値より早く発火する場合があります。※このイベントを利用するには Twitch アフィリエイト/パートナーで、Twitch 広告マネージャーが有効である必要があります。"
                    >
                        <firebot-select
                            options="{ 0: '無効', 1: '1分前', 3: '3分前', 5: '5分前', 10: '10分前', 15: '15分前', 20: '20分前' }"
                            ng-init="triggerUpcomingAdBreakMinutes = settings.getSetting('TriggerUpcomingAdBreakMinutes')"
                            selected="triggerUpcomingAdBreakMinutes"
                            on-update="settings.saveSetting('TriggerUpcomingAdBreakMinutes', option)"
                            right-justify="true"
                            aria-label="予定広告ブレイク事前通知トリガーを選択"
                        />
                    </firebot-setting>
                </div>
          `,
            controller: function ($scope, settingsService) {
                $scope.settings = settingsService;
            }
        });
}());
