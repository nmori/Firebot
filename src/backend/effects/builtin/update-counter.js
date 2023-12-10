"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const counterManager = require("../../counters/counter-manager");
const logger = require("../../logwrapper");

const model = {
    definition: {
        id: "firebot:update-counter",
        name: "カウンタを更新",
        description: "カウンタの値を更新",
        icon: "fad fa-tally",
        categories: [EffectCategory.COMMON, EffectCategory.ADVANCED],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <div ng-hide="hasCounters">
            <p>この演出を使用するには、カウンタを作成する必要があります！カウンタを作成するには、<b>カウンタ</b>タブに移動してください</p>
        </div>
        <div ng-show="hasCounters">
            <eos-container header="Counter">
                <dropdown-select options="counters" selected="effect.counterId"></dropdown-select>
            </eos-container>

            <div ng-show="effect.counterId">
                <eos-container header="Mode" pad-top="true">
                    <div class="controls-fb" style="padding-bottom: 5px;">
                        <label class="control-fb control--radio">増加 <tooltip text="'カウンタを指定された値だけ増加する（減少する場合は負の値を指定できる）'"></tooltip>
                            <input type="radio" ng-model="effect.mode" value="increment"/>
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--radio">Set <tooltip text="'カウンタを新しい値に設定する'"></tooltip>
                            <input type="radio" ng-model="effect.mode" value="set"/>
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                </eos-container>
            </div>

            <eos-container header="{{effect.mode == 'increment' ? '増額' : '新しい値'}}" pad-top="true" ng-show="effect.mode">
                <div class="input-group">
                    <span class="input-group-addon" id="delay-length-effect-type">値</span>
                    <input ng-model="effect.value" type="text" class="form-control" aria-describedby="delay-length-effect-type" type="text" replace-variables="number">
                </div>
            </eos-container>
        </div>
    `,
    optionsController: ($scope, countersService) => {

        $scope.hasCounters = countersService.counters.length > 0;

        $scope.counters = {};
        for (const counter of countersService.counters) {
            $scope.counters[counter.id] = counter.name;
        }

        if ($scope.effect.value === undefined) {
            $scope.effect.value = 1;
        }

    },
    optionsValidator: (effect, $scope) => {
        const errors = [];
        if (effect.counterId == null) {
            errors.push("カウンタを選択してください。");
        } else if (effect.mode == null) {
            errors.push("更新モードを選択してください。");
        } else if (effect.value === undefined || effect.value === "") {
            errors.push("更新値を入力してください。");
        }

        if ($scope.triggerType === 'counter') {
            if ($scope.triggerMeta && $scope.triggerMeta.counterEffectListType === 'update' && effect.counterId === $scope.triggerMeta.triggerId) {
                errors.push("カウンタを勝手に更新させることはできない。そうすると無限ループになるからだ。");
            }
        }

        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;

        if (effect.counterId == null || effect.mode == null || effect.value === undefined) {
            return true;
        }

        if (isNaN(effect.value)) {
            logger.warn(`Failed to update Counter ${effect.counterId} because ${effect.value} is not a number.`);
            return true;
        }

        await counterManager.updateCounterValue(effect.counterId, effect.value, effect.mode === "set");

        return true;
    }
};

module.exports = model;
