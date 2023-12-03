"use strict";

const timerManager = require("../../timers/timer-manager");
const { EffectCategory } = require('../../../shared/effect-constants');

const chat = {
    definition: {
        id: "firebot:toggle-timer",
        name: "タイマー状態を切替",
        description: "タイマーのアクティブ状態を切り替える",
        icon: "fad fa-toggle-off",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <p>この効果により、タイマーのアクティブステータスを自動的に切り替えることができます。</p>
        </eos-container>

        <eos-container ng-hide="hasTimers" pad-top="true">
            <span class="muted">タイマーはまだ作成されていません！<b>タイマー</b>タブで作成できます。</span>
        </eos-container>

        <eos-container ng-show="hasTimers" header="タイマー" pad-top="true">
            <dropdown-select options="timerOptions" selected="effect.selectedTimerId"></dropdown-select>
        </eos-container>

        <eos-container ng-show="hasTimers" header="切り替え" pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
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

        $scope.toggleOptions = {
            disable: "非アクティブ",
            enable: "アクティブ",
            toggle: "切り替え"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.selectedTimerId == null) {
            errors.push("タイマーを選んでください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;
        const timer = timerManager.getItem(effect.selectedTimerId);
        const isActive = effect.toggleType === "toggle" ? !timer.active : effect.toggleType === "enable";

        timerManager.updateTimerActiveStatus(effect.selectedTimerId, isActive);

        return true;
    }
};

module.exports = chat;
