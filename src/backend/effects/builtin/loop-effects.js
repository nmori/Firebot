"use strict";

const effectRunner = require("../../common/effect-runner");
const { EffectCategory } = require('../../../shared/effect-constants');
const logger = require("../../logwrapper");
const { SettingsManager } = require("../../common/settings-manager");
const conditionManager = require("./conditional-effects/conditions/condition-manager");
const { wait } = require("../../utils");

const model = {
    definition: {
        id: "firebot:loopeffects",
        name: "エフェクトループ",
        description: "エフェクトリストをループ実行します",
        icon: "fad fa-repeat-alt",
        categories: [EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <p>このエフェクトは、設定に応じて下のエフェクトリストをループ実行します。</p>
        </eos-container>

        <eos-container header="ループモード" pad-top="true">
            <div style="padding-left: 10px;">
                <label class="control-fb control--radio">回数指定 <span class="muted"><br />指定した回数だけループします。</span>
                    <input type="radio" ng-model="effect.loopMode" value="count" ng-change="loopModeChanged()"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" ng-hide="!whileLoopEnabled && effect.loopMode !== 'conditional'">条件付き <span class="muted"><br />条件が満たされている間、ループし続けます。</span>
                    <input type="radio" ng-model="effect.loopMode" value="conditional" ng-change="loopModeChanged()"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" >配列で反復 <span class="muted"><br />配列の各要素に対してループします。現在の要素は $loopItem で参照できます。</span>
                    <input type="radio" ng-model="effect.loopMode" value="array" ng-change="loopModeChanged()"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="{{effect.loopMode === 'count' ? 'ループ回数' : '最大ループ回数' }}" ng-hide="effect.loopMode === 'array'">
            <p ng-show="effect.loopMode === 'count'" class="muted">下のエフェクトリストをループする回数。</p>
            <p ng-show="effect.loopMode === 'conditional'" class="muted">条件が満たされていてもこの回数を超えるとループを強制終了します。無限ループ防止に便利です。最大回数を設けない場合は空欄にしてください。</p>
            <input type="text" ng-model="effect.loopCount" class="form-control" replace-variables="number" aria-label="ループ回数" placeholder="数値を入力">
        </eos-container>

        <eos-container header="反復する配列" ng-show="effect.loopMode === 'array'" pad-top="true">
            <p class="muted">ループ対象のJSON配列</p>
            <input type="text" ng-model="effect.arrayToIterate" class="form-control" replace-variables="text" aria-label="ループ配列" placeholder="JSON配列を入力">
        </eos-container>

        <eos-container header="ループ対象のエフェクト" pad-top="true">
            <div ng-show="effect.loopMode === 'conditional'">
                <condition-list condition-data="effect.conditionData" prefix="ながら" trigger="trigger" trigger-meta="triggerMeta"></condition-list>
                <div style="font-size: 15px;font-family: 'Quicksand'; color: #c0c1c2;margin-bottom:3px;">以下のエフェクトを実行する:</div>
            </div>

            <effect-list effects="effect.effectList"
                trigger="{{trigger}}"
                trigger-meta="triggerMeta"
                update="effectListUpdated(effects)"
                modalId="{{modalId}}"></effect-list>
        </eos-container>
    `,
    /**
   * The controller for the front end Options
   */
    optionsController: ($scope, settingsService) => {

        $scope.whileLoopEnabled = settingsService.getSetting("WhileLoopEnabled");

        if ($scope.effect.effectList == null) {
            $scope.effect.effectList = [];
        }

        if ($scope.effect.loopMode == null) {
            $scope.effect.loopMode = "count";
        }

        $scope.loopModeChanged = () => {
            if ($scope.effect.loopMode === "count") {
                $scope.effect.loopCount = "5";
            } else if ($scope.effect.loopMode === "conditional") {
                $scope.effect.loopCount = "25";
            }
        };

        $scope.effectListUpdated = function(effects) {
            $scope.effect.effectList = effects;
        };
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: (event) => {
        return new Promise(async (resolve) => {

            const { effect, trigger, outputs } = event;
            const effectList = effect.effectList;

            /**
             * @type {AbortSignal}
             */
            const abortSignal = event.abortSignal;

            let lastOutputs = outputs ?? {};

            if (!effectList || !effectList.list || effectList.list.length === 0 || abortSignal.aborted) {
                return resolve(true);
            }

            if (effect.loopMode === 'conditional' && !SettingsManager.getSetting("WhileLoopEnabled")) {
                return resolve(true);
            }

            const runEffects = async (loopCount = 0, loopItem = null, outputs = null) => {
                const trigger = event.trigger;
                trigger.metadata.loopCount = loopCount;
                trigger.metadata.loopItem = loopItem;
                const processEffectsRequest = {
                    trigger: trigger,
                    effects: {
                        id: effectList.id,
                        list: effectList.list,
                        queue: effectList.queue
                    },
                    outputs: outputs
                };

                try {
                    const result = await effectRunner.processEffects(processEffectsRequest);
                    return result;
                } catch (err) {
                    logger.warn("failed to run effects in loop effects effect", err);
                }
                return null;
            };

            if (effect.loopMode === 'count' || effect.loopMode == null) {

                let loopCount = effect.loopCount && effect.loopCount.trim();
                if (loopCount == null || isNaN(loopCount) || parseInt(loopCount) < 1) {
                    loopCount = 1;
                } else {
                    loopCount = parseInt(loopCount);
                }

                for (let i = 0; i < loopCount; i++) {
                    if (abortSignal.aborted) {
                        return resolve(true);
                    }
                    const result = await runEffects(i, null, lastOutputs);
                    lastOutputs = {
                        ...lastOutputs,
                        ...result?.outputs
                    };
                    if (result != null && result.success === true) {
                        if (result.stopEffectExecution) {
                            return resolve({
                                success: true,
                                execution: {
                                    stop: true,
                                    bubbleStop: true
                                }
                            });
                        }
                    }
                }

            } else if (effect.loopMode === 'conditional') {

                let currentLoopCount = 0;
                let maxLoopCount = null;
                if (effect.loopCount && !isNaN(effect.loopCount.trim()) && parseInt(effect.loopCount) > 0) {
                    maxLoopCount = parseInt(effect.loopCount);
                }

                while (true) {
                    if (abortSignal.aborted) {
                        return resolve(true);
                    }
                    if (effect.conditionData == null || effectList == null) {
                        break;
                    }

                    if (maxLoopCount && currentLoopCount >= maxLoopCount) {
                        break;
                    }

                    if (effect.conditionData == null || effect.conditionData.conditions == null) {
                        break;
                    }

                    const conditionsPass = await conditionManager.runConditions(effect.conditionData, {
                        ...trigger,
                        effectOutputs: lastOutputs
                    });

                    if (conditionsPass) {
                        const result = await runEffects(currentLoopCount, null, lastOutputs);
                        lastOutputs = {
                            ...lastOutputs,
                            ...result?.outputs
                        };
                        if (result != null && result.success === true) {
                            if (result.stopEffectExecution) {
                                return resolve({
                                    success: true,
                                    execution: {
                                        stop: true,
                                        bubbleStop: true
                                    }
                                });
                            }
                        }
                        await wait(1);
                    } else {
                        break;
                    }
                    currentLoopCount++;
                }
            } else if (effect.loopMode === 'array') {

                let arrayToIterate = effect.arrayToIterate;
                if (typeof arrayToIterate === 'string' || arrayToIterate instanceof String) {
                    try {
                        arrayToIterate = JSON.parse(`${arrayToIterate}`);
                    } catch (error) {
                        logger.error("Failed to parse array to iterate for loop effects", error);
                        return resolve(true);
                    }
                }

                if (!Array.isArray(arrayToIterate)) {
                    logger.error("Array to iterate it not an array.", arrayToIterate);
                    return resolve(true);
                }

                let currentLoopCount = 0;
                for (const item of arrayToIterate) {
                    if (abortSignal.aborted) {
                        return resolve(true);
                    }
                    const result = await runEffects(currentLoopCount, item, lastOutputs);
                    lastOutputs = {
                        ...lastOutputs,
                        ...result?.outputs
                    };
                    if (result != null && result.success === true) {
                        if (result.stopEffectExecution) {
                            return resolve({
                                success: true,
                                execution: {
                                    stop: true,
                                    bubbleStop: true
                                }
                            });
                        }
                    }
                    currentLoopCount++;
                }
            }

            resolve(true);
        });
    }
};

module.exports = model;
