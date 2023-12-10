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
                        />
                    </firebot-setting>

                </div>
          `,
            controller: function($scope, settingsService) {
                $scope.settings = settingsService;
            }
        });
}());
