"use strict";

const eventAccess = require("../../events/events-access");
const { EffectCategory } = require('../../../shared/effect-constants');

const chat = {
    definition: {
        id: "firebot:toggle-event",
        name: "繧､繝吶Φ繝医ｒ蛻・ｊ譖ｿ縺・,
        description: "繧､繝吶Φ繝医・繧｢繧ｯ繝・ぅ繝悶・繧ｹ繝・・繧ｿ繧ｹ繧貞・繧頑崛縺医ｋ",
        icon: "fad fa-toggle-off",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <p>縺薙・貍泌・繧剃ｽｿ縺・→縲√う繝吶Φ繝茨ｼ医う繝吶Φ繝医ち繝悶〒菴懈・縺ｧ縺阪∪縺呻ｼ峨・繧｢繧ｯ繝・ぅ繝悶せ繝・・繧ｿ繧ｹ繧定・蜍慕噪縺ｫ蛻・ｊ譖ｿ縺医ｋ縺薙→縺後〒縺阪∪縺吶・/p>
        </eos-container>

        <eos-container header="繧､繝吶Φ繝医げ繝ｫ繝ｼ繝・ pad-top="true">
            <dropdown-select options="eventGroupNames" selected="effect.selectedGroupName"></dropdown-select>
        </eos-container>

        <eos-container header="繧､繝吶Φ繝・ pad-top="true" ng-show="effect.selectedGroupName">
            <dropdown-select options="eventOptions[effect.selectedGroupName]" selected="effect.selectedEventId" value-mode="object"></dropdown-select>
        </eos-container>

        <eos-container header="蛻・ｊ譖ｿ縺・ pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, eventsService) => {

        const mainEvents = eventsService.getMainEvents();
        const groups = eventsService.getAllEventGroups();

        $scope.eventOptions = {
            "General Events": {}
        };

        for (const mainEvent of mainEvents) {
            $scope.eventOptions["General Events"][mainEvent.id] = mainEvent.name;
        }

        for (const [groupId, group] of Object.entries(groups)) {
            $scope.eventOptions[group.name] = {};

            for (const groupEvent of groups[groupId].events) {
                $scope.eventOptions[group.name][groupEvent.id] = groupEvent.name;
            }
        }

        $scope.eventGroupNames = Object.keys($scope.eventOptions);

        $scope.toggleOptions = {
            disable: "Deactivate",
            enable: "Activate",
            toggle: "Toggle"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.selectedEventId == null) {
            errors.push("Please select an event.");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;
        const selectedEvent = eventAccess.getEvent(effect.selectedEventId);
        const isActive = effect.toggleType === "toggle" ? !selectedEvent.active : effect.toggleType === "enable";

        eventAccess.updateEventActiveStatus(effect.selectedEventId, isActive);

        return true;
    }
};

module.exports = chat;
