"use strict";

(function() {

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
                            ng-init="selectedCmdMode = settings.getDefaultToAdvancedCommandMode()"
                            selected="selectedCmdMode"
                            on-update="settings.setDefaultToAdvancedCommandMode(option === 'true')"
                            right-justify="true"
                            aria-label="Choose your Default Mode For New Commands"
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
                            ng-init="ignoreSubEvents = settings.ignoreSubsequentSubEventsAfterCommunitySub()"
                            selected="ignoreSubEvents"
                            on-update="settings.setIgnoreSubsequentSubEventsAfterCommunitySub(option === 'true')"
                            right-justify="true"
                            aria-label="enable or disable Ignore Related Gift Sub Events"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Upcoming Scheduled Ad Break Trigger"
                        description="Use this to set the number of minutes before the next scheduled ad break to trigger the Scheduled Ad Break Starting Soon event, or disable it completely. This may trigger sooner than the configured value at the beginning of a stream, depending on your Twitch Ads Manager settings. NOTE: You must be a Twitch affiliate/partner and have the Twitch Ads Manager enabled in order for this event to trigger."
                    >
                        <firebot-select
                            options="{ 0: 'Disabled', 1: '1 minute', 3: '3 minutes', 5: '5 minutes', 10: '10 minutes', 15: '15 minutes', 20: '20 minutes' }"
                            ng-init="triggerUpcomingAdBreakMinutes = settings.getTriggerUpcomingAdBreakMinutes()"
                            selected="triggerUpcomingAdBreakMinutes"
                            on-update="settings.setTriggerUpcomingAdBreakMinutes(option)"
                            right-justify="true"
                            aria-label="Choose your Upcoming Scheduled Ad Break Trigger"
                        />
                    </firebot-setting>
                </div>
          `,
            controller: function($scope, settingsService) {
                $scope.settings = settingsService;
            }
        });
}());
