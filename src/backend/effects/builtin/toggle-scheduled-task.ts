import type { EffectType } from "../../../types";

import { ScheduledTaskManager } from "../../timers/scheduled-task-manager";

const effect: EffectType<{
    scheduledTaskId: string;
    toggleType: "toggle" | "enable" | "disable";
    useTag?: boolean;
    sortTagId?: string;
}> = {
    definition: {
        id: "firebot:toggle-scheduled-task",
        name: "演出予定リスト切り替え",
        description: "演出予定リストの有効状態を切り替えます",
        icon: "fad fa-toggle-off",
        categories: ["common", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container>
            <p>この演出を使うと、演出予定リストの有効状態を自動的に切り替えられます。</p>
        </eos-container>

        <eos-container ng-hide="!hasTags">
            <label class="control-fb control--checkbox"> ソートタグを使用</tooltip>
                <input type="checkbox" ng-model="effect.useTag">
                <div class="control__indicator"></div>
            </label>
        </eos-container>

        <eos-container ng-hide="hasScheduledTasks || effect.useTag" pad-top="true">
            <span class="muted">演出予定リストがまだ作成されていません。<b>タイマー</b>タブで作成できます。</span>
        </eos-container>

        <eos-container ng-hide="hasTags || !effect.useTag" pad-top="true">
            <span class="muted">演出予定リストのタグがまだ作成されていません。<b>タイマー</b>タブで作成できます。</span>
        </eos-container>

        <eos-container ng-show="hasScheduledTasks && !effect.useTag" header="演出予定リスト" pad-top="true">
            <dropdown-select options="scheduledTaskOptions" selected="effect.scheduledTaskId"></dropdown-select>
        </eos-container>

        <eos-container ng-show="hasTags && effect.useTag" header="タグ" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.sortTagId"
                placeholder="タグを選択または検索..."
                items="sortTags"
            />
        </eos-container>

        <eos-container ng-show="hasScheduledTasks || (hasTags && effect.useTag)" header="切り替えアクション" pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, scheduledTaskService, sortTagsService) => {

        const scheduledTasks = scheduledTaskService.getScheduledTasks();

        $scope.sortTags = sortTagsService.getSortTags('scheduled effect lists');

        $scope.scheduledTaskOptions = {};

        for (const scheduledTask of scheduledTasks) {
            $scope.scheduledTaskOptions[scheduledTask.id] = scheduledTask.name;
        }

        $scope.hasScheduledTasks = scheduledTasks != null && scheduledTasks.length > 0;
        $scope.hasTags = $scope.sortTags != null && $scope.sortTags.length > 0;

        if ($scope.scheduledTaskOptions[$scope.effect.scheduledTaskId] == null) {
            $scope.effect.scheduledTaskId = undefined;
        }

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
        if (!effect.useTag && effect.scheduledTaskId == null) {
            errors.push("演出予定リストを選択してください。");
        }
        if (effect.useTag && effect.sortTagId == null) {
            errors.push("演出予定リストのソートタグを選択してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect, scheduledTaskService, sortTagsService) => {
        const action = effect.toggleType === "toggle" ? "切り替え"
            : effect.toggleType === "enable" ? "有効化" : "無効化";
        if (effect.useTag) {
            const sortTag = sortTagsService.getSortTags('scheduled effect lists')
                .find(tag => tag.id === effect.sortTagId);
            return `${action} タグ: ${sortTag?.name ?? "不明"}`;
        }

        const scheduledTask = scheduledTaskService.getScheduledTasks().find(task => task.id === effect.scheduledTaskId);
        return `${action} ${scheduledTask?.name ?? "不明な演出予定リスト"}`;
    },
    onTriggerEvent: (event) => {
        const { effect } = event;
        if (!effect.useTag) {
            const scheduledTask = ScheduledTaskManager.getItem(effect.scheduledTaskId);
            scheduledTask.enabled = effect.toggleType === "toggle" ? !scheduledTask.enabled : effect.toggleType === "enable";

            ScheduledTaskManager.saveScheduledTask(scheduledTask);

            return true;
        }

        const tasks = ScheduledTaskManager.getAllItems().filter(task => task.sortTags?.includes(effect.sortTagId));

        tasks.forEach((scheduledTask) => {
            scheduledTask.enabled = effect.toggleType === "toggle" ? !scheduledTask.enabled : effect.toggleType === "enable";
            ScheduledTaskManager.saveScheduledTask(scheduledTask);
        });

        return true;
    }
};

export = effect;