"use strict";

(function () {
    angular.module("firebotApp").component("viewEffectOutputsModal", {
        template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">{{$ctrl.effectDefinition.name}}の出力設定</h4>
                </div>
                <div class="modal-body">
                    <div class="well-dark well-sm">いくつかの演出は、$variableを介して、連動された他の演出で参照できるデータを出力します。</div>
                    <div style="margin-top: 25px;">
                        <div
                            ng-repeat="output in $ctrl.effectDefinition.outputs"
                            style="margin-bottom: 15px;"
                        >
                            <div style="font-size: 16px;margin-bottom: 5px; color:#d0d0d0;">
                                {{output.label}} <tooltip text="output.description" />
                            </div>
                            <div style="display:flex">
                                <div style="font-weight: 500;font-size: 15px;">
                                    $effectOutput[{{$ctrl.effect.outputNames[output.defaultName]}}]
                                </div>
                                <div style="margin-left: 5px">
                                    <i
                                        class="fas fa-copy clickable-icon-on-dark"
                                        style="margin-right: 5px"
                                        uib-tooltip="Copy variable"
                                        append-tooltip-to-body="true"
                                        ng-click="$ctrl.copyOutputVariable(output)"
                                    ></i>
                                    <i
                                        class="fas fa-edit clickable-icon-on-dark"
                                        uib-tooltip="Edit name"
                                        append-tooltip-to-body="true"
                                        ng-click="$ctrl.showEditOutputNameModal(output)"
                                    ></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">{{$ctrl.hasMadeEdits ? 'キャンセル' : '閉じる'}}</button>
                    <button ng-if="$ctrl.hasMadeEdits" type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
                </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function ($rootScope, utilityService, ngToast) {
            const $ctrl = this;

            $ctrl.hasMadeEdits = false;

            $ctrl.effectDefinition = null;

            $ctrl.effect = {};

            $ctrl.showEditOutputNameModal = (output) => {
                utilityService.openGetInputModal(
                    {
                        model: $ctrl.effect.outputNames[output.defaultName],
                        label: "名前を変更する",
                        saveText: "保存する",
                        descriptionText: "演出リスト内で出力名に重複がないことを確認してください。2つの演出が同じ名前で出力されると、予期せぬ動作が起こる可能性があります。",
                        validationFn: (value) => {
                            return new Promise(resolve => {
                                if (value?.trim().length < 1) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "名前を入力してください."
                    },
                    (newName) => {
                        $ctrl.effect.outputNames[output.defaultName] = newName;
                        $ctrl.hasMadeEdits = true;
                    });
            };

            $ctrl.copyOutputVariable = (output) => {

                const variable = `$effectOutput[${$ctrl.effect.outputNames[output.defaultName]}]`;
                $rootScope.copyTextToClipboard(variable);

                ngToast.create({
                    className: 'success',
                    content: `コピーしました： '${variable}'!`
                });
            };

            $ctrl.$onInit = () => {
                $ctrl.effectDefinition = $ctrl.resolve.effectDefinition;
                $ctrl.effect = JSON.parse(JSON.stringify($ctrl.resolve.effect));

                $ctrl.effect.outputNames = $ctrl.effectDefinition.outputs.reduce((acc, curr) => {
                    if (!acc[curr.defaultName]) {
                        acc[curr.defaultName] = curr.defaultName;
                    }
                    return acc;
                }, $ctrl.effect.outputNames || {});
            };

            $ctrl.save = () => {
                $ctrl.close({
                    $value: {
                        outputNames: $ctrl.effect.outputNames
                    }
                });
            };
        }
    });
}());
