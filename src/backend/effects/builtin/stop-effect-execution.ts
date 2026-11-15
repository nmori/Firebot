import type { EffectType } from "../../../types";

import effectQueueRunner from "../queues/effect-queue-runner";
import { abortEffectList, abortEffect, abortAllEffectLists } from "../../common/effect-abort-helpers";

const model: EffectType<{
    target:
        | "currentList"
        | "specificList"
        | "queueActiveEffectLists"
        | "allActiveEffectLists"
        | "specificEffect";
    listId: string;
    effectId: string;
    queueId: string;
    bubbleStop: boolean;
}> = {
    definition: {
        id: "firebot:stop-effect-execution",
        name: "演出実行停止",
        description: "現在の演出リストの実行を停止します。",
        icon: "fad fa-stop-circle",
        categories: ["scripting", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="対象">
            <firebot-radios
                options="targetOptions"
                model="effect.target"
            />
        </eos-container>

        <eos-container header="演出リスト" ng-if="effect.target === 'specificList'" pad-top="true">
            <firebot-input
                input-title="演出リスト ID"
                title-tooltip="演出リストの ID は右上の三点メニューからコピーできます。"
                model="effect.listId"
                placeholder-text="ID を入力"
                data-type="text"
            />
        </eos-container>

        <eos-container header="演出" ng-if="effect.target === 'specificEffect'" pad-top="true">
            <firebot-input
                input-title="演出 ID"
                title-tooltip="演出の ID は三点メニューからコピーできます。"
                model="effect.effectId"
                placeholder-text="ID を入力"
                data-type="text"
            />
        </eos-container>

        <eos-container header="キュー" ng-if="effect.target === 'queueActiveEffectLists'" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.queueId"
                placeholder="キューを選択"
                items="queueOptions"
            />
        </eos-container>

        <eos-container
            header="オプション"
            ng-if="effect.target !== 'specificEffect'"
            pad-top="true"
        >
            <firebot-checkbox
                label="親演出リストに伝播"
                tooltip="演出実行停止リクエストをすべての親演出リストに伝播します（条件演出内のネスト等に便利です）。"
                model="effect.bubbleStop"
            />
        </eos-container>
    `,
    optionsController: ($scope, effectQueuesService) => {

        $scope.targetOptions = {
            currentList: { text: "現在の演出リスト", description: "この演出が含まれる演出リストの実行を停止します" },
            specificList: { text: "特定の演出リスト", description: "指定した ID の演出リストの実行を中断します" },
            queueActiveEffectLists: { text: "キューの実行中演出リスト", description: "指定したキューで現在実行中の演出リストを中断します" },
            allActiveEffectLists: { text: "実行中のすべての演出リスト", description: "現在実行中のすべての演出リストを中断します" },
            specificEffect: { text: "特定の演出", description: "指定した ID の演出の実行を中断します" }
        };

        $scope.queueOptions = [
            { id: "all", name: "すべてのキュー" },
            ...(effectQueuesService.getEffectQueues() ?? [])
        ];

        if ($scope.effect.target == null) {
            $scope.effect.target = "currentList";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (effect.target === "specificList" && !effect.listId) {
            errors.push("演出リスト ID を指定してください。");
        }

        if (effect.target === "specificEffect" && !effect.effectId) {
            errors.push("演出 ID を指定してください。");
        }

        if (effect.target === "queueActiveEffectLists" && !effect.queueId) {
            errors.push("キューを選択してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect, effectQueuesService) => {
        switch (effect.target) {
            case "currentList":
                return "現在の演出リスト";
            case "specificList":
                return `特定の演出リスト`;
            case "specificEffect":
                return `特定の演出`;
            case "queueActiveEffectLists":
                if (effect.queueId === "all") {
                    return "すべてのキューの実行中演出リスト";
                }
                return `キュー「${effectQueuesService.getEffectQueue(effect.queueId)?.name ?? "不明なキュー"}」の実行中演出リスト`;
            case "allActiveEffectLists":
                return "実行中のすべての演出リスト";
        }
    },
    onTriggerEvent: (event) => {
        const { effect } = event;

        if (effect.target == null || effect.target === "currentList") {
            return {
                success: true,
                execution: {
                    stop: true,
                    bubbleStop: effect.bubbleStop === true
                }
            };
        }

        if (effect.target === "specificList") {
            abortEffectList(effect.listId, effect.bubbleStop === true);
        } else if (effect.target === "specificEffect") {
            abortEffect(effect.effectId);
        } else if (effect.target === "queueActiveEffectLists") {
            if (effect.queueId === "all") {
                effectQueueRunner.abortActiveEffectListsForAllQueues(effect.bubbleStop === true);
            } else {
                effectQueueRunner.abortActiveEffectListsForQueue(effect.queueId, effect.bubbleStop === true);
            }
        } else if (effect.target === "allActiveEffectLists") {
            abortAllEffectLists(effect.bubbleStop === true);
        }

        return true;
    }
};

export = model;