"use strict";

(function() {
    angular.module("firebotApp").component("startupScriptsListModal", {
        template: `
            <div class="modal-header sticky-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">起動時スクリプト</h4>
            </div>
            <div class="modal-body">

                <div class="list-group" style="margin-bottom: 0;">
                    <div ng-repeat="script in $ctrl.sss.getStartupScripts() | orderBy: 'name' track by script.id"
                        style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 15px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;"
                    >
                        <div class="flex-row-center">
                            <i class="fas fa-plug" style="margin-right: 16px; font-size: 24px; opacity: 0.7;"></i>
                            <div>
                                <h4 class="list-group-item-heading"><strong>{{script.name}}</strong></h4>
                                <p class="list-group-item-text muted">{{script.scriptName}}</p>
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-default btn-lg"
                                style="margin-right: 10px"
                                ng-click="$ctrl.showAddOrEditStartupScriptModal(script)"
                                uib-tooltip="スクリプト設定を編集"
                                tooltip-append-to-body="true"
                            >
                                <i class="far fa-cog"></i>
                            </button>
                            <button class="btn btn-danger btn-lg"
                                ng-click="$ctrl.removeStartupScript(script)"
                                uib-tooltip="起動時スクリプトを削除"
                                tooltip-append-to-body="true"
                            >
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <span class="muted" ng-show="$ctrl.sss.getStartupScripts().length === 0">起動時スクリプトは追加されていません。</span>
                </div>

                <div class="muted" style="margin-top: 10px; font-size: 11px;" ng-show="$ctrl.sss.getStartupScripts().length > 0"><b>注記</b>: 追加/更新したスクリプトは Firebot を再起動するまで反映されません。</div>
            </div>
            <div class="modal-footer sticky-footer">
                <button type="button" class="btn btn-primary" ng-click="$ctrl.showAddOrEditStartupScriptModal();" style="width: 100%">
                    <i class="fas fa-plus" style="margin-right: 5px;"></i> 新しいスクリプトを追加
                </button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function(startupScriptsService, utilityService) {

            const $ctrl = this;

            $ctrl.sss = startupScriptsService;

            $ctrl.$onInit = function() {};

            $ctrl.removeStartupScript = (startupScript) => {
                utilityService.showConfirmationModal({
                    title: "起動時スクリプトを削除",
                    question: `起動時スクリプト「${startupScript.name}」を削除してもよろしいですか？`,
                    confirmLabel: "削除",
                    confirmBtnType: "btn-danger"
                }).then((confirmed) => {
                    if (confirmed) {
                        startupScriptsService.deleteStartupScriptData(startupScript.id);
                    }
                });
            };

            $ctrl.showAddOrEditStartupScriptModal = (scriptDataToEdit) => {
                utilityService.showModal({
                    component: "addOrEditStartupScriptModal",
                    windowClass: "no-padding-modal",
                    resolveObj: {
                        scriptData: () => scriptDataToEdit
                    },
                    dismissCallback: () => {
                    },
                    closeCallback: (resp) => {
                        const { scriptData } = resp;
                        startupScriptsService.saveStartupScriptData(scriptData);
                    }
                });
            };
        }
    });
}());
