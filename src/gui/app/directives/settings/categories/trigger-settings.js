"use strict";

(function () {

    angular
        .module("firebotApp")
        .component("triggerSettings", {
            template: `
                <div>
                    <firebot-setting-category
                        name="Commands"
                    />
                    <firebot-setting
                        name="コマンドモード"
                        description="新しいコマンドを作成するときに使用するデフォルトのコマンドモード（簡易 or 応用）"
                    >
                        <firebot-select
                            options="{ true: '応用', false: '簡易' }"
                            ng-init="selectedCmdMode = settings.getSetting('DefaultToAdvancedCommandMode')"
                            selected="selectedCmdMode"
                            on-update="settings.saveSetting('DefaultToAdvancedCommandMode', option === 'true')"
                            right-justify="true"
                            aria-label="新しいコマンドのデフォルトモードを選択する"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Streamer Account Exempt From Cooldowns"
                        description="When enabled, the streamer account will be able to use commands that are on cooldown"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('StreamerExemptFromCooldowns')"
                            on-toggle="settings.saveSetting('StreamerExemptFromCooldowns', !settings.getSetting('StreamerExemptFromCooldowns'))"
                            font-size="40"
                            aria-label="Streamer Account Exempt From Cooldowns, When enabled, the streamer account will be able to use commands that are on cooldown"
                            accessibility-label="(settings.getSetting('StreamerExemptFromCooldowns') ? 'Enabled' : 'Disabled') + ' When enabled, the streamer account will be able to use commands that are on cooldown'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="共有チャットがコマンドをトリガーすることを許可する"
                        description="Twitch Shared Chat中に、他のチャンネルで送信されたチャットメッセージによってコマンドがトリガーされるようになります。"
                    >
                        <firebot-select
                            options="{ true: 'Yes', false: 'No' }"
                            ng-init="allowSharedChatCommands = settings.getSetting('AllowCommandsInSharedChat')"
                            selected="allowSharedChatCommands"
                            on-update="settings.saveSetting('AllowCommandsInSharedChat', option === 'true')"
                            right-justify="true"
                            aria-label="共有チャットでコマンドをトリガーできるようにする"
                        />
                    </firebot-setting>

                    <firebot-setting-category
                        name="イベント"
                        pad-top="true"
                    />
                    <firebot-setting
                        name="ギフト、サブイベントを無視する"
                        description="この設定を有効にすると、Firebotはコミュニティギフトサブイベントの後に発生するギフトサブイベントを無視しようとします。つまり、Community Subイベントと受取人ごとのGift Subイベントが同時に発生するのではなく、Community Subイベントのみが発生するようになります。"
                    >
                        <firebot-select
                            options="{ true: '無視する', false: '無視しない' }"
                            ng-init="ignoreSubEvents = settings.getSetting('IgnoreSubsequentSubEventsAfterCommunitySub')"
                            selected="ignoreSubEvents"
                            on-update="settings.saveSetting('IgnoreSubsequentSubEventsAfterCommunitySub', option === 'true')"
                            right-justify="true"
                            aria-label="関連するギフトのサブイベントを無視するを有効または無効にする"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name=" 広告ブレイクのトリガー予定について"
                        description="これを使用して、Ad Break Soonイベントをトリガーできます。次の広告ブレイクの予定時刻の何分前を設定するか、または完全に無効にします。Twitch Ads Managerの設定によっては、ストリームの開始時に設定値よりも早くトリガーされる場合があります。注意: このイベントをトリガーするには、Twitchアフィリエイト/パートナーであり、Twitch Ads Managerを有効にしている必要があります。"
                    >
                        <firebot-select
                            options="{ 0: '無効', 1: '1 分', 3: '3 分', 5: '5 分', 10: '10 分', 15: '15 分', 20: '20 分' }"
                            ng-init="triggerUpcomingAdBreakMinutes = settings.getSetting('TriggerUpcomingAdBreakMinutes')"
                            selected="triggerUpcomingAdBreakMinutes"
                            on-update="settings.saveSetting('TriggerUpcomingAdBreakMinutes', option)"
                            right-justify="true"
                            aria-label="広告ブレイクのトリガーを選択してください。"
                        />
                    </firebot-setting>
                </div>
          `,
            controller: function ($scope, settingsService) {
                $scope.settings = settingsService;
            }
        });
}());
