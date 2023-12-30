"use strict";

const eventAccess = require("../../events/events-access");
const { EffectCategory } = require('../../../shared/effect-constants');

const chat = {
    definition: {
        id: "firebot:toggle-event-set",
        name: "イベントセットを切り替え",
        description: "イベントをアクティブ状態に切り替える",
        icon: "fad fa-toggle-off",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <p>この演出により、イベントセット（イベントタブで作成可能）のアクティブステータスを自動的に切り替えることができます。</p>
        </eos-container>

        <eos-container ng-hide="hasEventSets" pad-top="true">
            <span class="muted">イベントセットはまだ作成されていません！<b>イベント</b>タブで作成できます。</span>
        </eos-container>

        <eos-container ng-show="hasEventSets" header="イベントセット" pad-top="true">
            <dropdown-select options="eventSetOptions" selected="effect.selectedEventGroupId"></dropdown-select>
        </eos-container>

        <eos-container ng-show="hasEventSets" header="切り替え" pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, eventsService) => {

        const eventGroups = eventsService.getEventGroups();

        $scope.eventSetOptions = {};

        for (const eventGroup of eventGroups) {
            $scope.eventSetOptions[eventGroup.id] = eventGroup.name;
        }

        $scope.hasEventSets = eventGroups != null && eventGroups.length > 0;

        if ($scope.eventSetOptions[$scope.effect.selectedEventGroupId] == null) {
            $scope.effect.selectedEventGroupId = undefined;
        }

        $scope.toggleOptions = {
            disable: "OFF",
            enable: "ON"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.selectedEventGroupId == null) {
            errors.push("イベントセットを選択してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;

        eventAccess.updateEventGroupActiveStatus(effect.selectedEventGroupId, effect.toggleType === "enable");

        return true;
    }
};

module.exports = chat;
