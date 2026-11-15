"use strict";
(function() {
    angular
        .module("firebotApp")
        .component("reloadIndicator", {
            bindings: {},
            template: `
                <div class="reload-indicator-wrapper" ng-if="$ctrl.pendingFrontendReload()">
                    <button
                        class="app-bar-icon-btn"
                        aria-label="Firebot の再読み込みが必要です"
                        ng-click="$ctrl.reloadWindow()"
                        uib-tooltip="Firebot のメインウィンドウを再読み込みする必要があります。クリックして再読み込みします。"
                        tooltip-append-to-body="true"
                        tooltip-placement="bottom-right"
                    >
                        <i class="far fa-sync"></i>
                        <span class="update-indicator-badge"></span>
                    </button>
                </div>
            `,
            controller: function(pluginsService, modalFactory, backendCommunicator) {
                const ctrl = this;

                ctrl.pendingFrontendReload = () => {
                    return pluginsService.pendingFrontendReload === true;
                };

                ctrl.reloadWindow = () => {
                    modalFactory.showConfirmationModal({
                        title: "再読み込みが必要です",
                        question: "プラグインに変更があったため、Firebot のメインウィンドウを再読み込みする必要があります。今すぐ再読み込みしますか？",
                        tip: "注意: Firebot は引き続き動作しますが、現在開いているウィンドウ内の未保存の変更は失われます。",
                        cancelLabel: "いいえ、再読み込みしない",
                        cancelBtnType: "btn-default",
                        confirmLabel: "はい、今すぐ再読み込み"
                    }).then((confirmed) => {
                        if (confirmed) {
                            backendCommunicator.send("reload-main-window");
                        }
                    });
                };
            }
        });
}());