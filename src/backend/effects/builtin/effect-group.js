"use strict";

const effectRunner = require("../../common/effect-runner");
const { EffectCategory, EffectTrigger } = require('../../../shared/effect-constants');
const presetEffectListManager = require("../preset-lists/preset-effect-list-manager");

const effectGroup = {
    definition: {
        id: "firebot:run-effect-list",
        name: "演出リストを実行",
        description:
            "演出のプリセットまたはカスタムリストを実行",
        icon: "fad fa-list",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="List Type">
            <dropdown-select options="{ custom: 'Custom', preset: 'Preset'}" selected="effect.listType"></dropdown-select>
        </eos-container>

        <eos-container ng-show="effect.listType === 'preset'" header="プリセット演出" pad-top="true">
            <ui-select ng-model="effect.presetListId" theme="bootstrap"  on-select="presetListSelected($item)">
                <ui-select-match placeholder="プリセット演出リストの選択または検索... ">{{$select.selected.name}}</ui-select-match>
                <ui-select-choices repeat="presetList.id as presetList in presetEffectLists | filter: { name: $select.search }" style="position:relative;">
                    <div ng-bind-html="presetList.name | highlight: $select.search"></div>
                </ui-select-choices>
            </ui-select>

            <div style="margin-top: 15px">
                <button class="btn btn-default"
                    ng-show="effect.presetListId != null"
                    ng-click="editSelectedPresetList()">Edit '{{getSelectedPresetListName()}}'</button>
            </div>
        </eos-container>

        <eos-container ng-show="effect.listType === 'preset' && selectedPresetList != null" header="プリセットリストの引数" pad-top="true">
            <p>プリセット選択リストにデータを渡します</p>

            <div ng-repeat="arg in selectedPresetList.args track by $index" style="margin-bottom: 5px;">

                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span><b>{{arg.name}}: </b></span>
                    <div style="width: 100%; padding: 0 10px;">
                        <input type="text" class="form-control" placeholder="データを入れる" ng-model="effect.presetListArgs[arg.name]" replace-variables />
                    </div>
                </div>
            </div>
        </eos-container>

        <eos-container ng-show="effect.listType === 'custom'" header="カスタム演出リスト" pad-top="true">
            <effect-list effects="effect.effectList"
                    trigger="{{trigger}}"
                    trigger-meta="triggerMeta"
                    update="effectListUpdated(effects)"
                    modalId="{{modalId}}"></effect-list>
        </eos-container>

        <eos-container header="Options" pad-top="true">
            <firebot-checkbox
                model="effect.dontWait"
                label="演出が終わるのを待たない"
                tooltip="このリストをトリガーするルート演出リストが、これらの演出が完了するのを待つ代わりに、その演出の実行を継続したい場合は、これをチェックしてください。."
            />

            <firebot-checkbox
                ng-if="!effect.dontWait"
                style="margin-top: 10px"
                model="effect.bubbleOutputs"
                label="親リストに演出出力を適用する"
                tooltip="演出出力を親演出リストで利用可能にするかどうか"
            />
        </eos-container>

    `,
    optionsController: ($scope, presetEffectListsService) => {

        $scope.selectedPresetList = null;

        $scope.presetEffectLists = presetEffectListsService.getPresetEffectLists();

        $scope.presetListSelected = (presetList) => {
            $scope.selectedPresetList = presetList;
        };

        $scope.editSelectedPresetList = () => {
            if ($scope.selectedPresetList == null) {
                return;
            }
            presetEffectListsService.showAddEditPresetEffectListModal($scope.selectedPresetList)
                .then(presetList => {
                    if (presetList) {
                        $scope.selectedPresetList = presetList;
                    }
                });
        };

        $scope.getSelectedPresetListName = () => {
            return $scope.selectedPresetList ? $scope.selectedPresetList.name : "";
        };

        $scope.effectListUpdated = function(effects) {
            $scope.effect.effectList = effects;
        };

        if ($scope.effect.listType == null) {
            $scope.effect.listType = 'custom';
        }

        if ($scope.effect.presetListArgs == null) {
            $scope.effect.presetListArgs = {};
        }

        if ($scope.effect.presetListId != null) {
            const presetList = presetEffectListsService.getPresetEffectList($scope.effect.presetListId);
            if (presetList == null) {
                // preset list no longer exists
                $scope.effect.presetListId = null;
                $scope.effect.presetListArgs = {};
            } else {
                $scope.selectedPresetList = presetList;
            }
        }

    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.listType === 'preset' && effect.presetListId == null) {
            errors.push("プリセットリストを選択してください");
        }
        return errors;
    },
    onTriggerEvent: event => {
        return new Promise(resolve => {

            const { effect, trigger } = event;

            let processEffectsRequest = {};

            if (effect.listType === "preset") {
                const presetList = presetEffectListManager.getItem(effect.presetListId);
                if (presetList == null) {
                    // preset list doesnt exist anymore
                    return resolve(true);
                }

                // The original trigger may be in use down the chain of events,
                // we must therefore deepclone it in order to prevent mutations
                const newTrigger = JSON.parse(JSON.stringify(trigger));

                newTrigger.type = EffectTrigger.PRESET_LIST;
                newTrigger.metadata.presetListArgs = effect.presetListArgs;

                processEffectsRequest = {
                    trigger: newTrigger,
                    effects: presetList.effects
                };
            } else {
                const effectList = effect.effectList;

                if (!effectList || !effectList.list) {
                    return resolve(true);
                }

                processEffectsRequest = {
                    trigger: trigger,
                    effects: effectList
                };
            }

            const effectExecutionPromise = effectRunner.processEffects(processEffectsRequest);

            if (effect.dontWait) {
                resolve(true);
            } else {
                effectExecutionPromise.then(result => {
                    if (result != null && result.success === true) {

                        if (result.stopEffectExecution) {
                            return resolve({
                                success: true,
                                outputs: effect.bubbleOutputs ? result.outputs : undefined,
                                execution: {
                                    stop: true,
                                    bubbleStop: true
                                }
                            });
                        }
                    }
                    resolve({
                        success: true,
                        outputs: effect.bubbleOutputs ? result?.outputs : undefined
                    });
                });
            }
        });
    }
};

module.exports = effectGroup;
