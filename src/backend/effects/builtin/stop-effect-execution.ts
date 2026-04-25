import effectQueueRunner from "../queues/effect-queue-runner";
import { abortEffectList, abortEffect, abortAllEffectLists } from "../../common/effect-abort-helpers";
import { EffectType } from "../../../types/effects";

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
        name: "エフェクト実行停止",
        description: "現在のエフェクトリストの実行を停止します。",
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

        <eos-container header="エフェクトリスト" ng-if="effect.target === 'specificList'" pad-top="true">
            <firebot-input
                input-title="エフェクトリスト ID"
                title-tooltip="エフェクトリストの ID は右上の三点メニューからコピーできます。"
                model="effect.listId"
                placeholder-text="ID を入力"
                data-type="text"
            />
        </eos-container>

        <eos-container header="エフェクト" ng-if="effect.target === 'specificEffect'" pad-top="true">
            <firebot-input
                input-title="エフェクト ID"
                title-tooltip="エフェクトの ID は三点メニューからコピーできます。"
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
                label="親エフェクトリストに伝播"
                tooltip="エフェクト実行停止リクエストをすべての親エフェクトリストに伝播します（条件エフェクト内のネスト等に便利です）。"
                model="effect.bubbleStop"
            />
        </eos-container>
    `,
    optionsController: ($scope, effectQueuesService) => {

        $scope.targetOptions = {
            currentList: { text: "現在のエフェクトリスト", description: "このエフェクトが含まれるエフェクトリストの実行を停止します" },
            specificList: { text: "特定のエフェクトリスト", description: "指定した ID のエフェクトリストの実行を中断します" },
            queueActiveEffectLists: { text: "キューの実行中エフェクトリスト", description: "指定したキューで現在実行中のエフェクトリストを中断します" },
            allActiveEffectLists: { text: "実行中のすべてのエフェクトリスト", description: "現在実行中のすべてのエフェクトリストを中断します" },
            specificEffect: { text: "特定のエフェクト", description: "指定した ID のエフェクトの実行を中断します" }
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
            errors.push("エフェクトリスト ID を指定してください。");
        }

        if (effect.target === "specificEffect" && !effect.effectId) {
            errors.push("エフェクト ID を指定してください。");
        }

        if (effect.target === "queueActiveEffectLists" && !effect.queueId) {
            errors.push("キューを選択してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect, effectQueuesService) => {
        switch (effect.target) {
            case "currentList":
                return "現在のエフェクトリスト";
            case "specificList":
                return `特定のエフェクトリスト`;
            case "specificEffect":
                return `特定のエフェクト`;
            case "queueActiveEffectLists":
                if (effect.queueId === "all") {
                    return "すべてのキューの実行中エフェクトリスト";
                }
                return `キュー「${effectQueuesService.getEffectQueue(effect.queueId)?.name ?? "不明なキュー"}」の実行中エフェクトリスト`;
            case "allActiveEffectLists":
                return "実行中のすべてのエフェクトリスト";
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