"use strict";

(function () {
    angular.module("firebotApp").component("viewEffectOutputsModal", {
        template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">{{$ctrl.effectDefinition.name}} の出力</h4>
                </div>
                <div class="modal-body">
                    <div class="well-dark well-sm">一部のエフェクトは、後続エフェクトから $variable で参照できるデータを出力します。</div>
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
                                    <a href
                                        style="margin-right: 5px"
                                        uib-tooltip="変数をコピー"
                                        append-tooltip-to-body="true"
                                        ng-click="$ctrl.copyOutputVariable(output)">
                                        <span class="iconify clickable-icon-on-dark" data-icon="mdi:content-copy"></span>
                                    </a>
                                    <i
                                        class="fas fa-edit clickable-icon-on-dark"
                                        uib-tooltip="名前を編集"
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
                        label: "出力名を変更",
                        saveText: "保存",
                        descriptionText: "出力名はエフェクトリスト内で一意にしてください。同じ名前に複数エフェクトが出力すると予期しない動作になる可能性があります。",
                        validationFn: (value) => {
                            return new Promise((resolve) => {
                                if (value?.trim().length < 1) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "名前は空にできません。"
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
                    content: `'${variable}' をコピーしました。`
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
