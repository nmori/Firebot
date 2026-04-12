"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("databaseSettings", {
            template: `
                <div>

                    <firebot-setting
                        name="視聴者データベース"
                        description="視聴者トラッキングデータベースを有効/無効にします。状況によってはパフォーマンス改善が見込めます。"
                    >
                        <firebot-select
                            options="{ true: 'オン', false: 'オフ' }"
                            ng-init="viewerDb = settings.getSetting('ViewerDB')"
                            selected="viewerDb"
                            on-update="settings.saveSetting('ViewerDB', option === 'true')"
                            right-justify="true"
                            aria-label="視聴者データベースを有効または無効にする"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="既知Botの自動判定"
                        description="既知のBotが統計を生成したり、アクティブ視聴者リストへ表示されたりするのを防ぎます。"
                    >
                        <firebot-select
                            options="{ true: 'オン', false: 'オフ' }"
                            ng-init="autoFlagBots = settings.getSetting('AutoFlagBots')"
                            selected="autoFlagBots"
                            on-update="settings.saveSetting('AutoFlagBots', option === 'true')"
                            right-justify="true"
                            aria-label="既知Botの自動判定を有効または無効にする"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="視聴者テーブルのページサイズ"
                        description="視聴者テーブルで1ページあたりに表示する人数を選択します。"
                    >
                        <firebot-select
                            options="[5,10,15,20,25,30,35,40,45,50,55,60]"
                            ng-init="viewerListPageSize = settings.getSetting('ViewerListPageSize')"
                            selected="viewerListPageSize"
                            on-update="settings.saveSetting('ViewerListPageSize', option)"
                            right-justify="true"
                            aria-label="視聴者テーブルのページサイズを選択"
                        />
                    </firebot-setting>

                </div>
          `,
            controller: function($scope, settingsService) {
                $scope.settings = settingsService;
            }
        });
}());
