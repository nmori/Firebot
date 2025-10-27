import { EffectType } from "../../../types/effects";
import { TimerManager } from "../../timers/timer-manager";

const effect: EffectType<{
    selectedTimerId?: string;
    toggleType: "toggle" | "enable" | "disable";
    useTag?: boolean;
    sortTagId?: string;
}> = {
    definition: {
        id: "firebot:toggle-timer",
        name: "タイマーの有効・無効を切り替え",
        description: "タイマーの有効状態を切り替えます",
        icon: "fad fa-toggle-off",
        categories: ["common"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container>
            <p>このエフェクトを使うと、タイマーの有効状態を自動的に切り替えることができます。</p>
        </eos-container>

        <eos-container ng-hide="!hasTags">
            <label class="control-fb control--checkbox"> ソートタグを使用</tooltip>
                <input type="checkbox" ng-model="effect.useTag">
                <div class="control__indicator"></div>
            </label>
        </eos-container>

        <eos-container ng-hide="hasTimers || effect.useTag" pad-top="true">
            <span class="muted">まだタイマーは作成されていません！ <b>時間ベース</b>タブで作成できます。</span>
        </eos-container>

        <eos-container ng-hide="hasTags || !effect.useTag" pad-top="true">
            <span class="muted">まだタイマータグは作成されていません！ <b>時間ベース</b>タブで作成できます。</span>
        </eos-container>

        <eos-container ng-show="hasTimers && !effect.useTag" header="Timer" pad-top="true">
            <dropdown-select options="timerOptions" selected="effect.selectedTimerId"></dropdown-select>
        </eos-container>

        <eos-container ng-show="hasTags && effect.useTag" header="Tag" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.sortTagId"
                placeholder="タグを選択または検索..."
                items="sortTags"
            />
        </eos-container>

        <eos-container ng-show="hasTimers || (hasTags && effect.useTag)" header="Toggle Action" pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, timerService, sortTagsService) => {

        const timers = timerService.getTimers();

        $scope.sortTags = sortTagsService.getSortTags('timers');

        $scope.timerOptions = {};

        for (const timer of timers) {
            $scope.timerOptions[timer.id] = timer.name;
        }

        $scope.hasTimers = timers != null && timers.length > 0;
        $scope.hasTags = $scope.sortTags != null && $scope.sortTags.length > 0;

        if ($scope.timerOptions[$scope.effect.selectedTimerId] == null) {
            $scope.effect.selectedTimerId = undefined;
        }

        $scope.toggleOptions = {
            disable: "Deactivate",
            enable: "Activate",
            toggle: "Toggle"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.useTag && effect.selectedTimerId == null) {
            errors.push("Please select a timer.");
        }
        if (effect.useTag && effect.sortTagId == null) {
            errors.push("Please select a timer sort tag.");
        }
        return errors;
    },
    getDefaultLabel: (effect, timerService, sortTagsService) => {
        const action = effect.toggleType === "toggle" ? "Toggle"
            : effect.toggleType === "enable" ? "Activate" : "Deactivate";
        if (effect.useTag) {
            const sortTag = sortTagsService.getSortTags('timers')
                .find(tag => tag.id === effect.sortTagId);
            return `${action} tag: ${sortTag?.name ?? "Unknown"}`;
        }

        const timer = timerService.getTimers().find(timer => timer.id === effect.selectedTimerId);
        return `${action} ${timer?.name ?? "Unknown Timer"}`;
    },
    onTriggerEvent: (event) => {
        const { effect } = event;
        if (!effect.useTag) {
            const timer = TimerManager.getItem(effect.selectedTimerId);
            const isActive = effect.toggleType === "toggle" ? !timer.active : effect.toggleType === "enable";

            TimerManager.updateTimerActiveStatus(effect.selectedTimerId, isActive);

            return true;
        }
        const timers = TimerManager.getAllItems().filter(timer => timer.sortTags?.includes(effect.sortTagId));
        timers.forEach((timer) => {
            const isActive = effect.toggleType === "toggle" ? !timer.active : effect.toggleType === "enable";
            TimerManager.updateTimerActiveStatus(timer.id, isActive);
        });

        return true;
    }
};

export = effect;