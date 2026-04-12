"use strict";

(function() {
    angular.module("firebotApp").component("startupScriptsListModal", {
        template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">起動時スクリプト</h4>
            </div>
            <div class="modal-body">

                <div class="list-group" style="margin-bottom: 0;">
                    <span class="muted" ng-show="$ctrl.sss.getStartupScripts().length === 0">起動時スクリプトは追加されていません。</span>
                    <div class="list-group-item flex-row-center jspacebetween" ng-repeat="script in $ctrl.sss.getStartupScripts() track by script.id">
                        <div>
                            <h4 class="list-group-item-heading">{{script.name}}</h4>
                            <p class="list-group-item-text muted">({{script.scriptName}})</p>
                        </div>
                        <div style="font-size:17px">
                            <button class="btn btn-default" style="margin-right: 10px" ng-click="$ctrl.showAddOrEditStartupScriptModal(script)">編集</button>
                            <span uib-tooltip="起動時スクリプトを削除" tooltip-append-to-body="true" class="clickable" style="color:red;" ng-click="$ctrl.removeStartupScript(script)">
                                <i class="fas fa-trash-alt"></i>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="muted" style="margin-top: 10px; font-size: 11px;" ng-show="$ctrl.sss.getStartupScripts().length > 0"><b>注記</b>: 追加/更新したスクリプトは Firebot を再起動するまで反映されません。</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary pull-left" ng-click="$ctrl.showAddOrEditStartupScriptModal();">新しいスクリプトを追加</button>
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
