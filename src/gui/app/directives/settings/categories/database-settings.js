"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("databaseSettings", {
            template: `
                <div>

                    <firebot-setting
                        name="視聴者データベース"
                        description="視聴者データベースを使うかどうか。これにより、パフォーマンスが向上する場合があります。."
                    >
                        <firebot-select
                            options="{ true: 'On', false: 'Off' }"
                            ng-init="viewerDb = settings.getViewerDB()"
                            selected="viewerDb"
                            on-update="settings.setViewerDB(option === 'true')"
                            right-justify="true"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="自動Bot判定"
                        description="既知のBotが統計情報に入り込んだり、視聴者リストに表示されたりするのを防ぎます。"
                    >
                        <firebot-select
                            options="{ true: 'On', false: 'Off' }"
                            ng-init="autoFlagBots = settings.getAutoFlagBots()"
                            selected="autoFlagBots"
                            on-update="settings.setAutoFlagBots(option === 'true')"
                            right-justify="true"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="視聴者リストのサイズ"
                        description="視聴者リストにおいて１ページに表示される視聴者数を選択します。"
                    >
                        <firebot-select
                            options="[5,10,15,20,25,30,35,40,45,50,55,60]"
                            ng-init="viewerListPageSize = settings.getViewerListPageSize()"
                            selected="viewerListPageSize"
                            on-update="settings.setViewerListPageSize(option)"
                            right-justify="true"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="視聴者データの削除"
                        description="非アクティブな視聴者のデータを定期的に消すことができます"
                    >
                        <firebot-button
                            text="削除オプション"
                            ng-click="showPurgeViewersModal()"
                        />
                    </firebot-setting>

                </div>
          `,
            controller: function($scope, settingsService, utilityService) {
                $scope.settings = settingsService;

                $scope.showPurgeViewersModal = () => {
                    utilityService.showModal({
                        component: "purgeViewersModal",
                        size: 'sm',
                        backdrop: false,
                        keyboard: true
                    });
                };
            }
        });
}());
