"use strict";

const timerManager = require("../../timers/timer-manager");
const { EffectCategory } = require('../../../shared/effect-constants');

const chat = {
    definition: {
        id: "firebot:toggle-timer",
        name: "�^�C�}�[��Ԃ�ؑ�",
        description: "�^�C�}�[�̃A�N�e�B�u��Ԃ�؂�ւ���",
        icon: "fad fa-toggle-off",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <p>���̌��ʂɂ��A�^�C�}�[�̃A�N�e�B�u�X�e�[�^�X�������I�ɐ؂�ւ��邱�Ƃ��ł��܂��B</p>
        </eos-container>

        <eos-container ng-hide="hasTimers" pad-top="true">
            <span class="muted">�^�C�}�[�͂܂��쐬����Ă��܂���I<b>�^�C�}�[</b>�^�u�ō쐬�ł��܂��B</span>
        </eos-container>

        <eos-container ng-show="hasTimers" header="�^�C�}�[" pad-top="true">
            <dropdown-select options="timerOptions" selected="effect.selectedTimerId"></dropdown-select>
        </eos-container>

        <eos-container ng-show="hasTimers" header="�؂�ւ�" pad-top="true">
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
            disable: "��A�N�e�B�u",
            enable: "�A�N�e�B�u",
            toggle: "�؂�ւ�"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.selectedTimerId == null) {
            errors.push("�^�C�}�[��I��ł�������");
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
