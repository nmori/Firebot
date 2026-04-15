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
        <eos-container header="Target">
            <firebot-radios
                options="targetOptions"
                model="effect.target"
            />
        </eos-container>

        <eos-container header="Effect List" ng-if="effect.target === 'specificList'" pad-top="true">
            <firebot-input
                input-title="エフェクトリスト ID"
                title-tooltip="エフェクトリストの ID は右上の三点メニューからコピーできます。"
                model="effect.listId"
                placeholder-text="ID を入力"
                data-type="text"
            />
        </eos-container>

        <eos-container header="Effect" ng-if="effect.target === 'specificEffect'" pad-top="true">
            <firebot-input
                input-title="エフェクト ID"
                title-tooltip="エフェクトの ID は三点メニューからコピーできます。"
                model="effect.effectId"
                placeholder-text="ID を入力"
                data-type="text"
            />
        </eos-container>

        <eos-container header="Queue" ng-if="effect.target === 'queueActiveEffectLists'" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.queueId"
                placeholder="Select queue"
                items="queueOptions"
            />
        </eos-container>

        <eos-container
            header="Options"
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
            currentList: { text: "Current effect list", description: "Stops execution of the effect list that this effect resides in" },
            specificList: { text: "Specific effect list", description: "Abort the execution of a specific effect list by its ID" },
            queueActiveEffectLists: { text: "Active effect lists for queue", description: "Abort the execution of active effect lists from a queue" },
            allActiveEffectLists: { text: "All active effect lists", description: "Abort the execution of all actively running effect lists" },
            specificEffect: { text: "Specific effect", description: "Abort the execution of a specific effect by its ID" }
        };

        $scope.queueOptions = [
            { id: "all", name: "All queues" },
            ...(effectQueuesService.getEffectQueues() ?? [])
        ];

        if ($scope.effect.target == null) {
            $scope.effect.target = "currentList";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (effect.target === "specificList" && !effect.listId) {
            errors.push("Please provide an effect list ID");
        }

        if (effect.target === "specificEffect" && !effect.effectId) {
            errors.push("Please provide an effect ID");
        }

        if (effect.target === "queueActiveEffectLists" && !effect.queueId) {
            errors.push("Please select a queue");
        }

        return errors;
    },
    getDefaultLabel: (effect, effectQueuesService) => {
        switch (effect.target) {
            case "currentList":
                return "Current effect list";
            case "specificList":
                return `Specific effect list)`;
            case "specificEffect":
                return `Specific effect`;
            case "queueActiveEffectLists":
                if (effect.queueId === "all") {
                    return "Active Effect Lists for All Queues";
                }
                return `Active Effect Lists for Queue ${effectQueuesService.getEffectQueue(effect.queueId)?.name ?? "Unknown Queue"}`;
            case "allActiveEffectLists":
                return "All active effect lists";
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