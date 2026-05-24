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
                        <toggle-button
                            toggle-model="settings.getSetting('ViewerDB')"
                            on-toggle="settings.saveSetting('ViewerDB', !settings.getSetting('ViewerDB'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="既知Botの自動判定"
                        description="既知のBotが統計を生成したり、アクティブ視聴者リストへ表示されたりするのを防ぎます。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('AutoFlagBots')"
                            on-toggle="settings.saveSetting('AutoFlagBots', !settings.getSetting('AutoFlagBots'))"
                            font-size="40"
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
