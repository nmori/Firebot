"use strict";

(function () {
    const { v4: uuid } = require("uuid");

    angular.module("firebotApp").component("addOrEditPresetEffectListModal", {
        template: `
            <scroll-sentinel element-class="edit-preset-effect-list-header"></scroll-sentinel>
            <context-menu-modal-header
                class="edit-preset-effect-list-header"
                on-close="$ctrl.dismiss()"
                trigger-type="プリセット演出リスト"
                trigger-name="$ctrl.presetList.name"
                sort-tags="$ctrl.presetList.sortTags"
                show-trigger-name="true"
            ></context-menu-modal-header>
            <div class="modal-body">
                <div>
                    <h3>名前</h3>
                    <input type="text" class="form-control" placeholder="名前を入れる" ng-model="$ctrl.presetList.name">
                </div>

                <div>
                    <h3>引数</h3>
                    <p>このプリセット演出リストにデータを渡せるようにします</p>

                    <div class="role-bar" ng-repeat="arg in $ctrl.presetList.args track by $index">
                        <span uib-tooltip="$presetListArg[{{arg.name}}]でアクセス" tooltip-append-to-body="true">{{arg.name}}</span>
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
                    <collapsable-panel header="StreamDeckからの起動方法">
                        <p>手順:</p>
                        <ol>
                            <li ng-if="$ctrl.isNewPresetList === true">新しいプリセット演出リストを設定し、<strong>実行</strong>をクリックします</li>
                            <li>StreamDeckのボタンに「Website」アクションを追加します</li>
                            <li>URLを <strong>http://localhost:7472/api/v1/effects/preset/{{$ctrl.presetList.id}}</strong> に設定します</li>
                            <li>「GET request in background」にチェックを入れます</li>
                        </ol>
                    </collapsable-panel>
                </div>
            </div>

            <div class="modal-footer sticky-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">実行</button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function (ngToast, utilityService, presetEffectListsService) {
            const $ctrl = this;

            $ctrl.isNewPresetList = true;

            $ctrl.presetList = {
                id: uuid(),
                name: "",
                effects: null,
                args: [],
                sortTags: []
            };

            $ctrl.effectListUpdated = function (effects) {
                $ctrl.presetList.effects = effects;
            };

            $ctrl.addPresetListArg = () => {
                utilityService.openGetInputModal(
                    {
                        model: "",
                        label: "引数を追加",
                        inputPlaceholder: "名前を入れる",
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
                        validationText: "引数名は空にできず、一意である必要があります。"

                    },
                    (name) => {
                        $ctrl.presetList.args.push({ name: name.trim() });
                    });

            };

            $ctrl.deletePresetListArg = (index) => {
                $ctrl.presetList.args.splice(index, 1);
            };

            $ctrl.$onInit = function () {
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

            $ctrl.save = function () {
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
                        ngToast.create("プリセット演出リストの保存に失敗しました。もう一度試すか、ログで詳細を確認してください。");
                    }
            };
        }
    });
}());