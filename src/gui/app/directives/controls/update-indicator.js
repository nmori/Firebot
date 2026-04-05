"use strict";
(function() {
    angular
        .module("firebotApp")
        .component("updateIndicator", {
            bindings: {},
            template: `
                <div class="update-indicator-wrapper" ng-if="$ctrl.updateIsAvailable()">
                    <button
                        class="app-bar-icon-btn"
                        aria-label="アップデートがあります"
                        ng-click="$ctrl.showUpdateModal()"
                        uib-tooltip-html="$ctrl.tooltip"
                        tooltip-append-to-body="true"
                        tooltip-placement="bottom-right"
                    >
                        <i class="far fa-download"></i>
                        <span class="update-indicator-badge"></span>
                    </button>
                </div>
            `,
            controller: function($scope, updatesService, utilityService) {
                const ctrl = this;

                function updateTooltip() {
                    if (updatesService.newBetaAvailable) {
                        ctrl.tooltip = "<b>Firebot ベータアップデートがあります</b><br/>ベータアップデートが利用可能です。クリックしてリリースノートを確認し、アップデートをダウンロードできます。";
                    } else if (process.platform === 'win32' && updatesService.willAutoUpdate) {
                        ctrl.tooltip = "<b>Firebot アップデートがあります</b><br/>アップデートが利用可能で、次回 Firebot を閉じて再起動したときにインストールされます。";
                    } else {
                        ctrl.tooltip = "<b>Firebot アップデートがあります</b><br/>クリックしてリリースノートを確認し、アップデートをダウンロードできます。";
                    }
                }

                updateTooltip();

                $scope.$watchGroup([
                    () => updatesService.newBetaAvailable,
                    () => updatesService.willAutoUpdate
                ], function() {
                    updateTooltip();
                });

                ctrl.updateIsAvailable = () => {
                    return updatesService.updateIsAvailable();
                };

                ctrl.showUpdateModal = () => {
                    utilityService.showModal({
                        component: "updateModal",
                        backdrop: false
                    });
                };
            }
        });
}());