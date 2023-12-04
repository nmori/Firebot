"use strict";

(function() {

    const uuidv1 = require("uuid/v1");

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
                    <h3>Name</h3>
                    <input type="text" class="form-control" placeholder="名前を入れる" ng-model="$ctrl.presetList.name">
                </div>

                <div>
                    <h3>引数</h3>
                    <p>このプリセット演出リストにデータを渡せるようにします</p>

                    <div class="role-bar" ng-repeat="arg in $ctrl.presetList.args track by $index">
                        <span uib-tooltip="Access via $presetListArg[{{arg.name}}]" tooltip-append-to-body="true">{{arg.name}}</span>
                        <span class="clickable" style="padding-left: 10px;" ng-click="$ctrl.deletePresetListArg($index)" uib-tooltip="Remove arg" tooltip-append-to-body="true">
                            <i class="far fa-times"></i>
                        </span>
                    </div>
                    <div class="role-bar clickable" ng-click="$ctrl.addPresetListArg()" uib-tooltip="Add arg" tooltip-append-to-body="true">
                        <i class="far fa-plus"></i>
                    </div>
                </div>

                <div style="margin-top:20px;">
                    <effect-list effects="$ctrl.presetList.effects" trigger="preset" update="$ctrl.effectListUpdated(effects)"></effect-list>
                </div>

                <div style="margin-top: 20px;">
                    <collapsable-panel header="StreamDeckからの起動方法">
                        <p>Steps:</p>
                        <ol>
                            <li>StreamDeckボタンに "ウェブサイト "アクションを追加します</li>
                            <li>URL枠に次のアドレスを設定します。<b>http://localhost:7472/api/v1/effects/preset/{{$ctrl.presetList.id}}</b></li>
                            <li>"背景でGETリクエストを実行 "にチェックを入れる</li>
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
        controller: function(ngToast, utilityService, presetEffectListsService) {
            const $ctrl = this;

            $ctrl.isNewPresetList = true;

            $ctrl.presetList = {
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
                        label: "Add Argument",
                        inputPlaceholder: "名前を入れる",
                        saveText: "Save",
                        validationFn: (value) => {
                            return new Promise(resolve => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else if ($ctrl.presetList.args.some(a => a.name === value.trim())) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "Argument name cannot be empty and must be unique."

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

                if ($ctrl.isNewPresetList && $ctrl.presetList.id == null) {
                    $ctrl.presetList.id = uuidv1();
                }
            };

            $ctrl.save = function() {
                if ($ctrl.presetList.name == null || $ctrl.presetList.name === "") {
                    ngToast.create("Please provide a name for this Preset List");
                    return;
                }

                presetEffectListsService.savePresetEffectList($ctrl.presetList).then(successful => {
                    if (successful) {
                        $ctrl.close({
                            $value: {
                                presetEffectList: $ctrl.presetList
                            }
                        });
                    } else {
                        ngToast.create("Failed to save preset effect list. Please try again or view logs for details.");
                    }
                });
            };
        }
    });
}());
