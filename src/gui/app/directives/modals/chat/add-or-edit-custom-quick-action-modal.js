"use strict";

(function() {
    const uuidv1 = require("uuid/v1");

    angular.module("firebotApp")
        .component("addOrEditCustomQuickActionModal", {
            template: `
                <div class="modal-header" style="text-align: center">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">クイックアクションを編集</h4>
                </div>
                <div class="modal-body py-8 px-14">
                    <div class="mb-6">
                        <h3>名前</h3>
                        <p class="muted">名前は、クイックアクションにカーソルを合わせたときのヒントにもなります。</p>
                        <input type="text" class="form-control" placeholder="名前を入れる" ng-model="$ctrl.quickAction.name" required>
                    </div>
                    <div class="mb-6">
                        <h3>アイコン</h3>
                        <p class="muted">クイックアクションを識別できるカスタムアイコン</p>
                        <input maxlength="2" type="text" class="form-control" ng-model="$ctrl.quickAction.icon" icon-picker required>
                    </div>
                    <div>
                        <h3>演出リスト</h3>
                        <p class="muted">クイックアクションが起動されたときに実行される演出リスト。</p>
                        <dropdown-select options="{ custom: 'Custom', preset: 'Preset'}" selected="$ctrl.listType"></dropdown-select>
                        <div ng-if="$ctrl.listType === 'preset'" class="mt-8">
                            <ui-select ng-model="$ctrl.quickAction.presetListId" theme="bootstrap" on-select="$ctrl.presetListSelected($item)">
                                <ui-select-match placeholder="プリセット演出リストの選択または検索... ">{{$select.selected.name}}</ui-select-match>
                                <ui-select-choices repeat="presetList.id as presetList in $ctrl.presetEffectLists | filter: { name: $select.search }" style="position:relative;">
                                    <div ng-bind-html="presetList.name | highlight: $select.search"></div>
                                </ui-select-choices>
                            </ui-select>
                        </div>
                        <div ng-if="$ctrl.listType === 'custom'" class="mt-8">
                            <effect-list effects="$ctrl.quickAction.effectList"
                                trigger="quick_action"
                                trigger-meta="$ctrl.triggerMeta"
                                update="$ctrl.effectListUpdated(effects)"
                                modalId="{{modalId}}"
                            ></effect-list>
                        </div>
                    </div>
                    <div ng-if="$ctrl.listType === 'preset' && $ctrl.currentPresetArgs.length > 0">
                        <h3>Arguments</h3>
                        <div style="margin: 15px 0;display:flex;align-items:center;">
                            <toggle-button
                                toggle-model="$ctrl.quickAction.promptForArgs"
                                auto-update-value="true"
                                style="display:inline-block;"
                            />
                            <span class="ml-2">
                                クイックアクション発火時に引数の入力を促す
                            </span>
                        </div>
                        <div ng-if="!$ctrl.quickAction.promptForArgs">
                            <div
                                ng-repeat="arg in $ctrl.currentPresetArgs"
                                style="margin-bottom: 20px;"
                            >
                                <div style="font-size: 15px;font-weight: 600;margin-bottom:5px;">
                                    {{arg.name}}
                                </div>
                                <firebot-input 
                                    model="$ctrl.quickAction.presetArgValues[arg.name]" 
                                    input-type="string" 
                                    disable-variables="true" 
                                    placeholder-text="値を入れる" 
                                />
                            </div>
                        </div>
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
                dismiss: "&"
            },
            controller: function(presetEffectListsService, quickActionsService, ngToast) {
                const $ctrl = this;

                $ctrl.presetEffectLists = presetEffectListsService.getPresetEffectLists();
                $ctrl.listType = "custom";
                $ctrl.triggerMeta = {};

                $ctrl.effectListUpdated = (effects) => {
                    $ctrl.quickAction.effectList = effects;
                };

                $ctrl.quickAction = {
                    id: null,
                    name: "",
                    type: "custom",
                    icon: "far fa-magic",
                    presetListId: null,
                    presetArgValues: {},
                    promptForArgs: false,
                    effectList: null
                };

                $ctrl.currentPresetArgs = [];

                $ctrl.presetListSelected = (presetList) => {
                    $ctrl.currentPresetArgs = presetList.args || [];
                    $ctrl.quickAction.presetListId = presetList.id;
                    $ctrl.quickAction.presetArgValues = {};
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.resolve.quickAction != null) {
                        $ctrl.quickAction = JSON.parse(angular.toJson($ctrl.resolve.quickAction));
                    } else {
                        $ctrl.isNewQuickAction = true;
                    }

                    if ($ctrl.isNewQuickAction && $ctrl.quickAction.id == null) {
                        $ctrl.quickAction.id = uuidv1();
                    }

                    $ctrl.listType = $ctrl.quickAction.presetListId != null ? "preset" : "custom";

                    if ($ctrl.listType === "preset") {
                        const list = $ctrl.presetEffectLists.find(l => l.id === $ctrl.quickAction.presetListId);
                        $ctrl.currentPresetArgs = list?.args || [];
                    }
                };

                $ctrl.save = function() {
                    if ($ctrl.quickAction.name == null || $ctrl.quickAction.name === "") {
                        ngToast.create("このクイックアクションの名前を記入してください。");
                        return;
                    }

                    if (
                        ($ctrl.quickAction.presetListId == null || $ctrl.quickAction.presetListId === "") &&
                        ($ctrl.quickAction.effectList == null || !$ctrl.quickAction.effectList.list.length)
                    ) {
                        ngToast.create("このクイックアクションのカスタム／プリセット演出リストを選択してください。");
                        return;
                    }

                    if ($ctrl.quickAction.presetListId != null && $ctrl.listType === 'preset') {
                        $ctrl.quickAction.effectList = null;
                    }

                    if ($ctrl.quickAction.effectList != null && $ctrl.listType === 'custom') {
                        $ctrl.quickAction.presetListId = null;
                    }

                    if ($ctrl.quickAction.icon == null || $ctrl.quickAction.icon === "") {
                        $ctrl.quickAction.icon = "far fa-magic";
                    }

                    quickActionsService.saveCustomQuickAction($ctrl.quickAction).then(successful => {
                        if (successful) {
                            $ctrl.close();
                        } else {
                            ngToast.create("カスタムクイックアクションの保存に失敗しました。再試行するか、ログを表示して詳細を確認してください。");
                        }
                    });
                };
            }
        });
}());
