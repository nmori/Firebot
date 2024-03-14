"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("overlaySettings", {
            template: `
                <div>

                    <firebot-setting
                        name="オーバーレイ URL"
                        description="オーバーレイ設定画面を開き、URLと設定方法を確認"
                    >
                        <firebot-button
                            text="オーバーレイパスを取得"
                            ng-click="settings.showOverlayInfoModal()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="オーバーレイを複数使う"
                        description="配信ソフトウェアで複数のオーバーレイを使用できる機能を有効または無効にします。オンにすると、ビデオや画像の演出をどの配信ソフトで表示するか選択できるようになります。これは、クロマキーが必要な緑背景の映像を使用し、他のビデオや画像に影響を与えたくない場合に便利です。"
                    >
                        <span
                            style="padding-right: 10px"
                            ng-if="settings.useOverlayInstances()"
                        >
                            <a href ng-click="showEditOverlayInstancesModal()">複数使う場合の設定</a>
                        </span>
                        <firebot-select
                            options="{ true: 'On', false: 'Off' }"
                            ng-init="overlayInstances = settings.useOverlayInstances()"
                            selected="overlayInstances"
                            on-update="settings.setUseOverlayInstances(option === 'true')"
                            right-justify="true"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="オーバーレイ更新時にエフェクトを強制的に継続させる"
                        description="オーバーレイをリフレッシュしたり、エフェクトをクリアする場合、オーバーレイ上で再生中のビデオ再生やサウンド再生エフェクトは、待機に設定されていても、次のエフェクトに強制的に続行されます。"
                    >
                        <toggle-button
                            toggle-model="settings.getForceOverlayEffectsToContinueOnRefresh()"
                            on-toggle="settings.setForceOverlayEffectsToContinueOnRefresh(!settings.getForceOverlayEffectsToContinueOnRefresh())"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="フォント管理"
                        description="オーバーレイのテキスト表示演出で使用するフォントを管理します。フォントを変更する場合は、Firebotを再起動し、オーバーレイを更新する必要があります。"
                    >
                        <firebot-button
                            text="Manage Fonts"
                            ng-click="showFontManagementModal()"
                        />
                    </firebot-setting>

                </div>
          `,
            controller: function($scope, settingsService, utilityService) {
                $scope.settings = settingsService;

                $scope.showFontManagementModal = function() {
                    utilityService.showModal({
                        component: "fontManagementModal",
                        size: "sm"
                    });
                };

                $scope.showEditOverlayInstancesModal = function() {
                    utilityService.showModal({
                        component: "editOverlayInstancesModal"
                    });
                };
            }
        });
}());
