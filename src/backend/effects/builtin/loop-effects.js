"use strict";

const effectRunner = require("../../common/effect-runner");
const { EffectCategory } = require('../../../shared/effect-constants');
const logger = require("../../logwrapper");
const { settings } = require("../../common/settings-access");
const conditionManager = require("./conditional-effects/conditions/condition-manager");

const wait = ms => new Promise(r => setTimeout(r, ms));

const model = {
    definition: {
        id: "firebot:loopeffects",
        name: "ループ演出",
        description: "演出リストのループ",
        icon: "fad fa-repeat-alt",
        categories: [EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <p>この演出は、指定された設定に基づき、以下の演出リストをループします。</p>
        </eos-container>

        <eos-container header="ループモード" pad-top="true">
            <div style="padding-left: 10px;">
                <label class="control-fb control--radio">Set Number <span class="muted"><br />Loop a set number of times.</span>
                    <input type="radio" ng-model="effect.loopMode" value="count" ng-change="loopModeChanged()"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" ng-hide="!whileLoopEnabled && effect.loopMode !== 'conditional'">条件 <span class="muted"><br />条件が満たされている間、ループを続ける</span>
                    <input type="radio" ng-model="effect.loopMode" value="conditional" ng-change="loopModeChanged()"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" >Iterate Array <span class="muted"><br />JSON配列をループする。$loopItem で現在のアイテムにアクセスする </span>
                    <input type="radio" ng-model="effect.loopMode" value="array" ng-change="loopModeChanged()"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="{{effect.loopMode === 'count' ? 'Loop Count' : 'Max Loop Count' }}" ng-hide="effect.loopMode === 'array'">
            <p ng-show="effect.loopMode === 'count'" class="muted">以下の演出リストがループする回数</p>
            <p ng-show="effect.loopMode === 'conditional'" class="muted">ループを強制的に停止させるまでの最大ループ回数。無限ループが発生しないようにするのに便利です。最大回数を指定しない場合は、空のままにします。</p>
            <input type="text" ng-model="effect.loopCount" class="form-control" replace-variables="number" aria-label="Loop count" placeholder="値を入力">
        </eos-container>

        <eos-container header="Array To Iterate" ng-show="effect.loopMode === 'array'" pad-top="true">
            <p class="muted">ループする JSON 配列</p>
            <input type="text" ng-model="effect.arrayToIterate" class="form-control" replace-variables="text" aria-label="ループ配列" placeholder="JSON配列を入力">
        </eos-container>

        <eos-container header="ループする演出" pad-top="true">
            <div ng-show="effect.loopMode === 'conditional'">
                <condition-list condition-data="effect.conditionData" prefix="While" trigger="trigger" trigger-meta="triggerMeta"></condition-list>
                <div style="font-size: 15px;font-family: 'Quicksand'; color: #c0c1c2;margin-bottom:3px;">以下の演出を実行する:</div>
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

        $scope.whileLoopEnabled = settingsService.getWhileLoopEnabled();

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

            let lastOutputs = outputs ?? {};

            if (!effectList || !effectList.list) {
                return resolve(true);
            }

            if (effect.loopMode === 'conditional' && !settings.getWhileLoopEnabled()) {
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

                while (true) { //eslint-disable-line no-constant-condition
                    if (effect.conditionData == null || effectList == null) {
                        break;
                    }

                    if (maxLoopCount && currentLoopCount >= maxLoopCount) {
                        break;
                    }

                    if (effect.conditionData == null || effect.conditionData.conditions == null) {
                        break;
                    }

                    const conditionsPass = await conditionManager.runConditions(effect.conditionData, trigger);

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
