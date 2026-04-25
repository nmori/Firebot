import type { EffectType } from "../../../types/effects";
import { EventsAccess } from "../../events/events-access";

const effect: EffectType<{
    selectedEventId: string;
    selectedGroupName: string;
    toggleType: "disable" | "enable" | "toggle";
}> = {
    definition: {
        id: "firebot:toggle-event",
        name: "イベント切り替え",
        description: "イベントの有効状態を切り替えます",
        icon: "fad fa-toggle-off",
        categories: ["common", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container>
            <p>このエフェクトを使うと、イベント（イベントタブで作成できます）の有効／無効を自動で切り替えられます。</p>
        </eos-container>

        <eos-container header="イベントグループ" pad-top="true">
            <dropdown-select options="eventGroupNames" selected="effect.selectedGroupName"></dropdown-select>
        </eos-container>

        <eos-container header="イベント" pad-top="true" ng-show="effect.selectedGroupName">
            <dropdown-select options="eventOptions[effect.selectedGroupName]" selected="effect.selectedEventId" value-mode="object"></dropdown-select>
        </eos-container>

        <eos-container header="切り替え操作" pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, eventsService) => {
        const mainEvents = eventsService.getMainEvents();
        const groups = eventsService.getAllEventGroups();

        $scope.eventOptions = {
            "一般イベント": {}
        };

        for (const mainEvent of mainEvents) {
            $scope.eventOptions["一般イベント"][mainEvent.id] = mainEvent.name;
        }

        for (const [groupId, group] of Object.entries(groups) as [string, any]) {
            $scope.eventOptions[group.name] = {};

            for (const groupEvent of groups[groupId].events) {
                $scope.eventOptions[group.name][groupEvent.id] = groupEvent.name;

                // Update the effect should the event set have been renamed
                if ($scope.effect.selectedEventId === groupEvent.id) {
                    $scope.effect.selectedGroupName = group.name;
                }
            }
        }

        $scope.eventGroupNames = Object.keys($scope.eventOptions);

        $scope.toggleOptions = {
            disable: "無効化",
            enable: "有効化",
            toggle: "切り替え"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.selectedEventId == null) {
            errors.push("イベントを選択してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect, eventsService) => {
        const event = eventsService.getAllEvents().find(ev => ev.id === effect.selectedEventId);
        const action = effect.toggleType === "toggle" ? "切り替え"
            : effect.toggleType === "enable" ? "有効化" : "無効化";
        return `${event?.name ?? "不明なイベント"} を ${action}`;
    },
    onTriggerEvent: ({ effect }) => {
        const selectedEvent = EventsAccess.getEvent(effect.selectedEventId);
        const isActive = effect.toggleType === "toggle" ? !selectedEvent.active : effect.toggleType === "enable";

        EventsAccess.updateEventActiveStatus(effect.selectedEventId, isActive);

        return true;
    }
};

export = effect;