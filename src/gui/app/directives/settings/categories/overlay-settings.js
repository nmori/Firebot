"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("overlaySettings", {
            template: `
                <div>

                    <firebot-setting
                        name="オーバーレイURL"
                        description="オーバーレイ設定モーダルを開いて URL と設定方法を確認します。"
                    >
                        <firebot-button
                            text="オーバーレイパスを取得"
                            ng-click="showOverlayInfoModal()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="オーバーレイインスタンス"
                        description="配信ソフトで複数のオーバーレイインスタンスを利用する機能を有効/無効にします。有効時は動画や画像エフェクトの表示先インスタンスを選択できます。クロマキー用素材を他の動画・画像へ影響させたくない場合に便利です。"
                    >
                        <span
                            style="padding-right: 10px"
                            ng-if="settings.getSetting('UseOverlayInstances')"
                        >
                            <a href ng-click="showEditOverlayInstancesModal()">インスタンスを編集</a>
                        </span>
                        <firebot-select
                            options="{ true: 'オン', false: 'オフ' }"
                            ng-init="overlayInstances = settings.getSetting('UseOverlayInstances')"
                            selected="overlayInstances"
                            on-update="settings.saveSetting('UseOverlayInstances', option === 'true')"
                            right-justify="true"
                            aria-label="オーバーレイインスタンスを有効化または無効化"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="オーバーレイ解像度"
                        description="配信ソフトで使用するオーバーレイブラウザソースの解像度です。オーバーレイウィジェットの位置とサイズ調整に使用されます。"
                    >
                        <span
                            style="padding-right: 10px"
                        >
                            {{ overlayResolution.width }} x {{ overlayResolution.height }}
                        </span>
                        <firebot-button
                            text="編集"
                            ng-click="openEditOverlayResolutionModal()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="オーバーレイ更新時にエフェクトを強制継続"
                        description="オーバーレイ更新や Clear Effects 実行時に、そのオーバーレイで再生中の Play Video / Play Sound が待機設定でも次のエフェクトへ進むようにします。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ForceOverlayEffectsToContinueOnRefresh')"
                            on-toggle="settings.saveSetting('ForceOverlayEffectsToContinueOnRefresh', !settings.getSetting('ForceOverlayEffectsToContinueOnRefresh'))"
                            font-size="40"
                            accessibility-label="(settings.getSetting('ForceOverlayEffectsToContinueOnRefresh') ? '有効' : '無効') + '
                             オーバーレイ更新または Clear Effects 実行時に、再生中の Play Video / Play Sound を待機設定でも次のエフェクトへ進めます。'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="フォント管理"
                        description="オーバーレイの Show Text エフェクトで使用するフォントを管理します。フォント変更後は Firebot の再起動とオーバーレイ更新が必要です。"
                    >
                        <firebot-button
                            text="フォントを管理"
                            ng-click="showFontManagementModal()"
                        />
                    </firebot-setting>

                </div>
          `,
            controller: function($scope, settingsService, utilityService, modalFactory) {
                $scope.settings = settingsService;

                $scope.showOverlayInfoModal = function(overlayInstance) {
                    utilityService.showOverlayInfoModal(overlayInstance);
                };

                $scope.showEditOverlayInstancesModal = function() {
                    utilityService.showModal({
                        component: "editOverlayInstancesModal"
                    });
                };

                $scope.overlayResolution = settingsService.getSetting("OverlayResolution") ?? { width: 1280, height: 720 };

                $scope.openEditOverlayResolutionModal = function() {
                    modalFactory.openEditOverlayResolutionModal((newResolution) => {
                        $scope.overlayResolution = newResolution;
                    });
                };

                $scope.showFontManagementModal = function() {
                    utilityService.showModal({
                        component: "fontManagementModal",
                        size: "sm"
                    });
                };
            }
        });
}());
