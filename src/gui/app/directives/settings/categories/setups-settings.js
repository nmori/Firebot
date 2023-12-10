"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("setupsSettings", {
            template: `
                <div>

                    <firebot-setting 
                        name="セットアップ設定の取り込み"
                        description="他人が作成したFirebotセットアップ(.firebotsetupファイル)を取り込みします！"
                    >
                        <firebot-button 
                            text="設定を取り込む"
                            ng-click="showImportSetupModal()"
                        />
                    </firebot-setting>

                    <firebot-setting 
                        name="セットアップ設定を作る"
                        description="新規Firebotセットアップ（コマンド、イベント、通貨などの設定）を作成し、他の人と共有します"
                    >
                        <firebot-button 
                            text="新規設定を作る"
                            ng-click="showCreateSetupModal()"
                        />
                    </firebot-setting>

                    <firebot-setting 
                        name="セットアップ設定を消す"
                        description="セットアップファイルを選択すると、Firebotが現在保存されているすべての一致する構成部品（コマンド、イベントなど）を検索して削除します。以前に取り込んだセットアップを完全に削除したい場合に便利です。"
                    >
                        <firebot-button 
                            text="セットアップ設定を消す"
                            ng-click="showRemoveSetupModal()"
                        />
                    </firebot-setting>

                    
                </div>
          `,
            controller: function($scope, settingsService, utilityService) {
                $scope.settings = settingsService;

                $scope.showImportSetupModal = () => {
                    utilityService.showModal({
                        component: "importSetupModal",
                        backdrop: false
                    });
                };

                $scope.showCreateSetupModal = () => {
                    utilityService.showModal({
                        component: "createSetupModal"
                    });
                };

                $scope.showRemoveSetupModal = () => {
                    utilityService.showModal({
                        component: "removeSetupModal",
                        backdrop: true
                    });
                };

            }
        });
}());
