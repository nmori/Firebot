"use strict";

(function() {
    angular.module("firebotApp")
        .component("addOrEditVariableMacroModal", {
            template: `
                <scroll-sentinel element-class="edit-macro-header"></scroll-sentinel>
                <div class="modal-header sticky-header edit-macro-header">
                    <button
                        type="button"
                        class="close"
                        aria-label="閉じる"
                        ng-click="$ctrl.dismiss()"
                    >
                        <i class="fal fa-times" aria-hidden="true"></i>
                    </button>
                    <h4 class="modal-title">
                        <div class="action text-4xl">{{$ctrl.isNewMacro ? '新しいマクロを追加' : 'マクロを編集:'}}</div>
                        <div class="text-4xl font-semibold" ng-show="!$ctrl.isNewMacro">{{$ctrl.macro.name}}</div>
                    </h4>
                </div>
                <div class="modal-body">
                    <form name="macroSettings">
                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('name')}">
                            <label for="name" class="control-label">名前</label>
                            <div style="position: relative;">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    ng-minlength="3"
                                    ui-validate="{valid:'$ctrl.macroNameIsValid($value)', taken:'!$ctrl.macroNameIsTaken($value)'}"
                                    required
                                    class="form-control input-lg"
                                    placeholder="マクロ名を入力"
                                    ng-model="$ctrl.macro.name"
                                    ng-disabled="$ctrl.nameFieldLocked"
                                    ng-style="{'padding-right': $ctrl.nameFieldLocked ? '77px' : ''}"
                                    ng-keyup="$event.keyCode == 13 && $ctrl.save()"
                                    ng-keydown="$event.keyCode != 13 ? $event:$event.preventDefault()"
                                />
                                <div
                                    style="width: 67px;size: 16px;position: absolute;top: 50%;transform: translateY(-50%);right: 10px;"
                                    class="flex items-center justify-center"
                                    ng-if="$ctrl.nameFieldLocked"
                                >
                                    <button
                                        class="btn btn-default btn-xs"
                                        ng-click="$ctrl.unlockNameField()"
                                    ><i class="fas fa-lock"></i> ロック中</button>
                                </div>
                            </div>
                            <div ng-if="$ctrl.formFieldHasError('name')">
                                <span ng-if="macroSettings.name.$error.required" class="help-block">名前は必須です。</span>
                                <span ng-if="macroSettings.name.$error.minlength" class="help-block">名前は3文字以上で入力してください。</span>
                                <span ng-if="macroSettings.name.$error.valid && !macroSettings.name.$error.required && !macroSettings.name.$error.minlength" class="help-block">名前の形式が正しくありません。</span>
                                <span ng-if="macroSettings.name.$error.taken" class="help-block">この名前はすでに使用されています。</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="expression" class="control-label">説明</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                class="form-control input-lg"
                                style="font-size: 16px; padding: 10px 16px;"
                                ng-model="$ctrl.macro.description"
                                placeholder="任意"
                                ng-keyup="$event.keyCode == 13 && $ctrl.save()"
                                ng-keydown="$event.keyCode != 13 ? $event:$event.preventDefault()"
                            />
                        </div>

                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('expression')}">
                            <label for="expression" class="control-label">変数式</label>
                            <textarea
                                type="text"
                                id="expression"
                                name="expression"
                                ng-minlength="1"
                                required
                                class="form-control input-lg"
                                style="font-size: 16px; padding: 10px 16px; height: 100px;"
                                placeholder="変数式を入力"
                                rows="4"
                                cols="40"
                                ng-model="$ctrl.macro.expression"
                                replace-variables
                                menu-position="under"
                            />
                        </div>

                        <div class="form-group">
                            <label for="args" class="control-label">引数</label>
                            <editable-list settings="$ctrl.argListSettings" model="$ctrl.macro.argNames" />
                        </div>
                    </form>
                </div>
                <div class="modal-footer sticky-footer edit-macro-footer">
                    <button type="button" class="btn btn-danger pull-left" ng-click="$ctrl.delete()" ng-if="!$ctrl.isNewMacro">削除</button>
                    <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
                </div>
                <scroll-sentinel element-class="edit-macro-footer"></scroll-sentinel>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&",
                modalInstance: "<"
            },
            controller: function($scope, ngToast, utilityService, variableMacroService) {
                const $ctrl = this;

                $ctrl.isNewMacro = true;

                $ctrl.nameFieldLocked = false;

                $ctrl.validationErrors = {};

                /**
                 * @type {import('../../../../../types/variable-macros').VariableMacro}
                 */
                $ctrl.macro = {
                    id: null,
                    name: null,
                    expression: null,
                    argNames: []
                };

                $ctrl.argListSettings = {
                    sortable: true,
                    showIndex: false,
                    hintTemplate: "$^{name}",
                    showCopyButton: true,
                    copyTemplate: "$^{name}",
                    addLabel: "マクロ引数を追加",
                    editLabel: "マクロ引数を編集",
                    inputPlaceholder: "引数名を入力",
                    noDuplicates: true,
                    customValidators: [
                        (argName) => {
                            if (/^\d+$/.test(argName)) {
                                return {
                                    success: false,
                                    reason: "引数名を数字のみにはできません。"
                                };
                            }
                            return true;
                        },
                        (argName) => {
                            if (!/^.{2,}$/.test(argName)) {
                                return {
                                    success: false,
                                    reason: "引数名は2文字以上である必要があります。"
                                };
                            }
                            return true;
                        },
                        (argName) => {
                            if (!/^[a-z]+/.test(argName)) {
                                return {
                                    success: false,
                                    reason: "引数名は小文字で開始する必要があります。"
                                };
                            }
                            return true;
                        },
                        (argName) => {
                            if (!/^[a-z][a-zA-Z0-9]+$/.test(argName)) {
                                return {
                                    success: false,
                                    reason: "引数名は英数字のみ（スペース・記号不可）で入力してください。"
                                };
                            }
                            return true;
                        }
                    ]
                };

                $ctrl.formFieldHasError = (fieldName) => {
                    return ($scope.macroSettings.$submitted || $scope.macroSettings[fieldName].$touched)
                        && $scope.macroSettings[fieldName].$invalid;
                };

                $ctrl.macroNameIsTaken = (name) => {
                    if (name == null) {
                        return false;
                    }
                    const matchingMacro = variableMacroService.getMacroByName(name);

                    if (matchingMacro != null && ($ctrl.isNewMacro || matchingMacro.id !== $ctrl.macro.id)) {
                        return true;
                    }
                    return false;
                };

                $ctrl.macroNameIsValid = (name) => {
                    if (name == null) {
                        return false;
                    }

                    return variableMacroService.isMacroNameValid(name);
                };

                $ctrl.unlockNameField = () => {
                    utilityService
                        .showConfirmationModal({
                            title: "警告",
                            question: "マクロ名を変更すると、エフェクト内の参照を手動更新する必要があります。名前を変更しますか？",
                            confirmLabel: "変更する",
                            confirmBtnType: "btn-default"
                        })
                        .then((confirmed) => {
                            if (confirmed) {
                                $ctrl.nameFieldLocked = false;
                                setTimeout(() => {
                                    angular.element("#name").focus();
                                }, 100);
                            }
                        });
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.resolve.macro != null) {
                        $ctrl.macro = JSON.parse(angular.toJson($ctrl.resolve.macro));
                        $ctrl.isNewMacro = false;
                        $ctrl.nameFieldLocked = true;
                    }
                };

                $ctrl.save = () => {
                    $scope.macroSettings.$setSubmitted();
                    if ($scope.macroSettings.$invalid) {
                        return;
                    }

                    variableMacroService.saveMacro($ctrl.macro).then((successful) => {
                        if (successful) {
                            $ctrl.dismiss();
                        } else {
                            ngToast.create("マクロの保存に失敗しました。再試行するか、ログで詳細を確認してください。");
                        }
                    });
                };

                $ctrl.delete = function() {
                    if ($ctrl.isNewMacro) {
                        return;
                    }

                    utilityService
                        .showConfirmationModal({
                            title: "マクロを削除",
                            question: "このマクロを削除しますか？",
                            confirmLabel: "削除",
                            confirmBtnType: "btn-danger"
                        })
                        .then((confirmed) => {
                            if (confirmed) {
                                variableMacroService.deleteMacro($ctrl.macro.id);
                                $ctrl.dismiss();
                            }
                        });
                };
            }
        });
})();
