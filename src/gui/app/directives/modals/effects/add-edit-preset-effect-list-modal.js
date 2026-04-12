"use strict";

(function() {
    const { randomUUID } = require("crypto");

    angular.module("firebotApp").component("addOrEditPresetEffectListModal", {
        template: `
            <scroll-sentinel element-class="edit-preset-effect-list-header"></scroll-sentinel>
            <context-menu-modal-header
                class="edit-preset-effect-list-header"
                on-close="$ctrl.dismiss()"
                trigger-type="preset effect list"
                trigger-name="$ctrl.presetList.name"
                sort-tags="$ctrl.presetList.sortTags"
                show-trigger-name="true"
            ></context-menu-modal-header>
            <div class="modal-body">
                <div>
                    <h3>名前</h3>
                    <input type="text" class="form-control" placeholder="名前を入力" ng-model="$ctrl.presetList.name">
                </div>

                <div>
                    <h3>引数</h3>
                    <p>このプリセットエフェクトリストにデータを渡せます。</p>

                    <div class="role-bar" ng-repeat="arg in $ctrl.presetList.args track by $index">
                        <span uib-tooltip="$presetListArg[{{arg.name}}] で参照できます" tooltip-append-to-body="true">{{arg.name}}</span>
                        <span class="clickable" style="padding-left: 10px;" ng-click="$ctrl.deletePresetListArg($index)" uib-tooltip="引数を削除" tooltip-append-to-body="true">
                            <i class="far fa-times"></i>
                        </span>
                    </div>
                    <div class="role-bar clickable" ng-click="$ctrl.addPresetListArg()" uib-tooltip="引数を追加" tooltip-append-to-body="true">
                        <i class="far fa-plus"></i>
                    </div>
                </div>

                <div style="margin-top:20px;">
                    <effect-list
                    effects="$ctrl.presetList.effects"
                    trigger="preset"
                    trigger-meta="{ rootEffects: $ctrl.presetList.effects, presetListArgs: $ctrl.presetList.args }"
                    update="$ctrl.effectListUpdated(effects)"
                ></effect-list>
                </div>

                <div style="margin-top: 20px;">
                    <collapsable-panel header="Stream Deck からの実行方法">
                        <p>手順:</p>
                        <ol>
                            <li ng-if="$ctrl.isNewPresetList === true">新しいプリセットエフェクトリストを設定して<strong>保存</strong>をクリック</li>
                            <li>Stream Deck ボタンに「Website」アクションを追加</li>
                            <li>URL を <strong>http://localhost:7472/api/v1/effects/preset/{{$ctrl.presetList.id}}</strong<></li>
                            <li>「GET request in background」をオンにする</li>
                        </ol>
                    </collapsable-panel>
                </div>
            </div>

            <div class="modal-footer sticky-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function(ngToast, utilityService, presetEffectListsService) {
            const $ctrl = this;

            $ctrl.isNewPresetList = true;

            $ctrl.presetList = {
                id: randomUUID(),
                name: "",
                effects: null,
                args: [],
                sortTags: []
            };

            $ctrl.effectListUpdated = function(effects) {
                $ctrl.presetList.effects = effects;
            };

            $ctrl.addPresetListArg = () => {
                utilityService.openGetInputModal(
                    {
                        model: "",
                        label: "引数を追加",
                        inputPlaceholder: "名前を入力",
                        saveText: "保存",
                        validationFn: (value) => {
                            return new Promise((resolve) => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else if ($ctrl.presetList.args.some(a => a.name === value.trim())) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "引数名は必須で、重複できません。"

                    },
                    (name) => {
                        $ctrl.presetList.args.push({ name: name.trim() });
                    });

            };

            $ctrl.deletePresetListArg = (index) => {
                $ctrl.presetList.args.splice(index, 1);
            };

            $ctrl.$onInit = function() {
                if ($ctrl.resolve.presetList) {
                    $ctrl.presetList = JSON.parse(
                        angular.toJson($ctrl.resolve.presetList)
                    );

                    if ($ctrl.presetList.args == null) {
                        $ctrl.presetList.args = [];
                    }

                    $ctrl.isNewPresetList = false;
                }
            };

            $ctrl.save = function() {
                if ($ctrl.presetList.name == null || $ctrl.presetList.name === "") {
                    ngToast.create("このプリセットリストの名前を入力してください");
                    return;
                }

                const savedList = presetEffectListsService.savePresetEffectList($ctrl.presetList, $ctrl.isNewPresetList);
                if (savedList != null) {
                    $ctrl.close({
                        $value: {
                            presetEffectList: savedList
                        }
                    });
                } else {
                    ngToast.create("プリセットエフェクトリストの保存に失敗しました。再試行するか、ログを確認してください。");
                }
            };
        }
    });
}());