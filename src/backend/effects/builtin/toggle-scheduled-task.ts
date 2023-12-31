import { EffectType } from "../../../types/effects";
import { EffectCategory } from '../../../shared/effect-constants';
import scheduledTaskManager from "../../timers/scheduled-task-manager";

const model: EffectType<{
    scheduledTaskId: string;
    toggleType: string;
}> = {
    definition: {
        id: "firebot:toggle-scheduled-task",
        name: "演出予定リストを切り替え",
        description: "演出予定リストの状態を切り替える",
        icon: "fad fa-toggle-off",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container>
            <p>この演出は、"演出予定リストの有効状態を切り替えます。</p>
        </eos-container>

        <eos-container ng-hide="hasScheduledTasks" pad-top="true">
            <span class="muted">"演出予定リストはまだ作成されていません！作成は <b>予定</b> タブから作成します</span>
        </eos-container>

        <eos-container ng-show="hasScheduledTasks" header=""演出予定リスト" pad-top="true">
            <dropdown-select options="scheduledTaskOptions" selected="effect.scheduledTaskId"></dropdown-select>
        </eos-container>

        <eos-container ng-show="hasScheduledTasks" header="切り替え" pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, scheduledTaskService) => {

        const scheduledTasks = scheduledTaskService.getScheduledTasks();

        $scope.scheduledTaskOptions = {};

        for (const scheduledTask of scheduledTasks) {
            $scope.scheduledTaskOptions[scheduledTask.id] = scheduledTask.name;
        }

        $scope.hasScheduledTasks = scheduledTasks != null && scheduledTasks.length > 0;

        if ($scope.scheduledTaskOptions[$scope.effect.scheduledTaskId] == null) {
            $scope.effect.scheduledTaskId = undefined;
        }

        $scope.toggleOptions = {
            disable: "Disable",
            enable: "Enable",
            toggle: "Toggle"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.scheduledTaskId == null) {
            errors.push("Please select a scheduled effect list.");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;
        const scheduledTask = scheduledTaskManager.getItem(effect.scheduledTaskId);
        scheduledTask.enabled = effect.toggleType === "toggle" ? !scheduledTask.enabled : effect.toggleType === "enable";

        scheduledTaskManager.saveScheduledTask(scheduledTask);

        return true;
    }
};

export = model;