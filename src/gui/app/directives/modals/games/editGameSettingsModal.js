"use strict";

(function() {
    angular.module("firebotApp").component("editGameSettingsModal", {
        template: `
            <div class="modal-header">
                <button type="button" class="close" aria-label="Close" ng-click="$ctrl.dismiss()"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">
                    <div style="font-size: 22px;">ゲームの編集:</div>
                    <div style="font-weight:bold;font-size: 24px;">{{$ctrl.game.name}}</div>
                </h4>
            </div>
            <div class="modal-body">

                <setting-container ng-if="$ctrl.game.description">
                    <p>{{$ctrl.game.description}}</p>
                </setting-container>

                <setting-container>
                    <div class="controls-fb-inline" style="margin-bottom: 12px;">
                        <label class="control-fb control--checkbox">有効化
                            <input type="checkbox" ng-model="$ctrl.game.active" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                    <p class="muted" style="margin-top: 20px;">注意: 有効にすると、このゲームに関連するコマンドの表示、起動条件の編集、権限調整ができます。</p>
                </setting-container>

                <setting-container ng-if="$ctrl.game.settingCategories != null" ng-repeat="categoryMeta in $ctrl.settingCategoriesArray | orderBy:'sortRank'"  header="{{categoryMeta.title}}" description="{{categoryMeta.description}}" pad-top="$index > 0 ? true : false" collapsed="true">
                    <command-option ng-repeat="setting in categoryMeta.settingsArray | orderBy:'sortRank'"
                                name="setting.settingName"
                                metadata="setting"></command-option>
                </setting-container>

            </div>
            <div class="modal-footer sticky-footer edit-game-footer">
                <button ng-show="$ctrl.game != null" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.resetToDefaults()">初期値に戻す</button>
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button ng-show="$ctrl.game != null" type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
            <scroll-sentinel element-class="edit-game-footer"></scroll-sentinel>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function(ngToast, utilityService) {
            const $ctrl = this;

            $ctrl.game = null;

            $ctrl.settingCategoriesArray = [];

            $ctrl.$onInit = function() {
                if ($ctrl.resolve.game) {
                    $ctrl.game = JSON.parse(JSON.stringify($ctrl.resolve.game));
                    $ctrl.settingCategoriesArray = Object.values($ctrl.game.settingCategories)
                        .map(sc => {
                            sc.settingsArray = [];
                            const settingNames = Object.keys(sc.settings);
                            for (const settingName of settingNames) {
                                const setting = sc.settings[settingName];
                                setting.settingName = settingName;
                                sc.settingsArray.push(setting);
                            }
                            return sc;
                        });
                } else {
                    $ctrl.dismiss();
                }
            };

            $ctrl.resetToDefaults = () => {
                utilityService
                    .showConfirmationModal({
                        title: `初期値に戻す`,
                        question: `本当に${$ctrl.game.name}を初期設定にリセットしますか？`,
                        confirmLabel: "リセットする",
                        confirmBtnType: "btn-danger"
                    })
                    .then(confirmed => {
                        if (confirmed) {
                            $ctrl.close({
                                $value: {
                                    gameId: $ctrl.game.id,
                                    action: "reset"
                                }
                            });
                        }
                    });
            };

            function validate() {
                if ($ctrl.game.settingCategories) {
                    for (const category of Object.values($ctrl.game.settingCategories)) {
                        for (const setting of Object.values(category.settings)) {
                            if (setting.validation) {
                                if (setting.validation.required) {
                                    if (setting.type === 'string' && setting.value === "") {
                                        ngToast.create(`値を入力してください：${setting.title}`);
                                        return false;
                                    } else if (setting.type === 'editable-list' && (setting.value == null || setting.value.length === 0)) {
                                        ngToast.create(`値を入力してください：${setting.title}`);
                                        return false;
                                    } else if (setting.type === 'multiselect' && (setting.value == null || setting.value.length === 0)) {
                                        ngToast.create(`値を選択してください：${setting.title} `);
                                        return false;
                                    } else if (setting.value === null || setting.value === undefined) {
                                        ngToast.create(`値を入力してください：${setting.title} `);
                                        return false;
                                    }
                                }
                                if (setting.type === "number") {
                                    if (!isNaN(setting.validation.min) && setting.value < setting.validation.min) {
                                        ngToast.create(`設定値 ${setting.title} は ${setting.validation.min} 以上に設定してください`);
                                        return false;
                                    }
                                    if (!isNaN(setting.validation.max) && setting.value > setting.validation.max) {
                                        ngToast.create(`設定値 ${setting.title} は ${setting.validation.max} 以下に設定してください`);
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
                return true;
            }

            $ctrl.save = () => {
                if (!validate()) {
                    return;
                }

                $ctrl.close({
                    $value: {
                        game: $ctrl.game,
                        action: "save"
                    }
                });
            };
        }
    });
}());
