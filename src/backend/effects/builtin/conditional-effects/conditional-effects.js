"use strict";

const { EffectCategory } = require('../../../../shared/effect-constants');
const effectRunner = require("../../../common/effect-runner");
const conditionManager = require("./conditions/condition-manager");
const builtinConditionTypeLoader = require("./conditions/builtin-condition-loader");

builtinConditionTypeLoader.registerConditionTypes();

const model = {
    definition: {
        id: "firebot:conditional-effects",
        name: "条件付き演出",
        description: "条件付き演出",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        icon: "fad fa-question-circle",
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>

        <div ui-sortable="sortableOptions" ng-model="effect.ifs">
            <div ng-repeat="ifCondition in effect.ifs" style="margin-bottom: 15px;">
                <condition-section header="{{$index === 0 ? 'If' : 'Else If'}}" label="ifCondition.label" initially-open="$index === 0 && openFirst">
                    <condition-list condition-data="ifCondition.conditionData" trigger="trigger" trigger-meta="triggerMeta"></condition-list>
                    <div style="font-size: 15px;font-family: 'Quicksand'; color: #c0c1c2;margin-bottom:3px;">Then run the following effects:</div>
                    <effect-list effects="ifCondition.effectData"
                        trigger="{{trigger}}"
                        trigger-meta="triggerMeta"
                        update="effectListUpdated(effects, $index)"
                        modalId="{{modalId}}"></effect-list>

                    <div style="margin-top: 10px">
                        <button class="btn btn-danger" ng-click="deleteClauseAtIndex($index)"><i class="far fa-trash"></i></button>
                    </div>
                </condition-section>
            </div>
        </div>

            <button class="btn btn-link" ng-click="addIf()"><i class="fal fa-plus-circle"></i> Add <strong>{{effect.ifs.length === 0 ? 'If' : 'Else If'}}</strong> 条件</button>

            <div style="margin-top: 15px;">

                <condition-section header="Otherwise" label="effect.otherwiseLabel" draggable="false">
                    <div style="padding-bottom: 10px;padding-left: 2px;font-size: 15px;font-family: 'Quicksand'; color: #c0c1c2;">
                        <span>上記のいずれの条件もパスしない場合は、以下の演出を実行する：</span>
                    </div>
                    <effect-list effects="effect.otherwiseEffectData"
                        trigger="{{trigger}}"
                        trigger-meta="triggerMeta"
                        update="otherwiseEffectListUpdated(effects)"
                        modalId="{{modalId}}"></effect-list>
                </condition-section>

            </div>
        </eos-container>

        <eos-container header="Options" pad-top="true">
            <firebot-checkbox
                model="effect.bubbleOutputs"
                label="親リストに演出出力を適用する"
                tooltip="演出出力を親演出リストで利用可能にするかどうか"
            />
        </eos-container>
    `,
    optionsController: ($scope, utilityService) => {

        $scope.sortableOptions = {
            handle: ".dragHandle",
            stop: () => {}
        };

        $scope.openFirst = false;
        if ($scope.effect.ifs == null) {
            $scope.effect.ifs = [{
                conditionData: null,
                effectData: null
            }];
            $scope.openFirst = true;
        }

        $scope.addIf = () => {
            $scope.effect.ifs.push({
                conditionData: null,
                effectData: null
            });
        };

        $scope.deleteClauseAtIndex = $index => {
            utilityService.showConfirmationModal({
                title: "条件を削除",
                question: `本当に削除しますか？ ${$index === 0 ? 'IF' : 'IF ELSE'} ?`,
                confirmLabel: "削除する",
                confirmBtnType: "btn-danger"
            }).then(confirmed => {
                if (confirmed) {
                    $scope.effect.ifs.splice($index, 1);
                }
            });
        };

        $scope.effectListUpdated = (effects, index) => {
            const ifCondition = $scope.effect.ifs[index];
            if (ifCondition) {
                ifCondition.effectData = effects;
            }
        };

        $scope.otherwiseEffectListUpdated = (effects) => {
            $scope.effect.otherwiseEffectData = effects;
        };
    },
    optionsValidator: () => {
        const errors = [];
        return errors;
    },
    onTriggerEvent: event => {
        return new Promise(async (resolve) => {
            // What should this do when triggered.
            const { effect, trigger } = event;

            let effectsToRun = null;
            if (effect.ifs != null) {
                for (const ifCondition of effect.ifs) {
                    if (ifCondition.conditionData == null || ifCondition.effectData == null) {
                        continue;
                    }

                    const didPass = await conditionManager.runConditions(ifCondition.conditionData, trigger);
                    if (didPass) {
                        effectsToRun = ifCondition.effectData;
                        break;
                    }
                }
            }

            if (effectsToRun == null) {
                effectsToRun = effect.otherwiseEffectData;
            }

            if (effectsToRun != null) {
                const processEffectsRequest = {
                    trigger: event.trigger,
                    effects: effectsToRun
                };

                effectRunner.processEffects(processEffectsRequest)
                    .then(result => {
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
            } else {
                resolve(true);
            }
        });
    }
};

module.exports = model;
