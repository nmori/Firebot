"use strict";

const timerManager = require("../../timers/timer-manager");
const { EffectCategory } = require('../../../shared/effect-constants');

const chat = {
    definition: {
        id: "firebot:reset-timer",
        name: "タイマーをリセット",
        description: "タイマーのインターバルを強制的に再開させる",
        icon: "fad fa-stopwatch",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <p>この演出を使うと、タイマーの間隔を強制的に再開させることができます。</p>
        </eos-container>

        <eos-container ng-hide="hasTimers" pad-top="true">
            <span class="muted">タイマーはまだ作成されていません！作成は<b>タイマー</b>タブからどうぞ</span>
        </eos-container>

        <eos-container ng-show="hasTimers" header="タイマー" pad-top="true">
            <dropdown-select options="timerOptions" selected="effect.selectedTimerId"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, timerService) => {

        const timers = timerService.getTimers();

        $scope.timerOptions = {};

        for (const timer of timers) {
            $scope.timerOptions[timer.id] = timer.name;
        }

        $scope.hasTimers = timers != null && timers.length > 0;

        if ($scope.timerOptions[$scope.effect.selectedTimerId] == null) {
            $scope.effect.selectedTimerId = undefined;
        }
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.selectedTimerId == null) {
            errors.push("タイマーを選択してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;

        const timer = timerManager.getItem(effect.selectedTimerId);

        if (timer) {
            timerManager.updateIntervalForTimer(timer);
        }

        return true;
    }
};

module.exports = chat;
