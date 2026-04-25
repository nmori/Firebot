import type { EffectType, EffectQueueConfig } from "../../../types/effects";
import { EffectQueueConfigManager } from "../queues/effect-queue-config-manager";
import queueRunner from "../queues/effect-queue-runner";
import logger from "../../logwrapper";

const effect: EffectType<{
    effectQueueId: string;
}> = {
    definition: {
        id: "firebot:trigger-manual-effect-queue",
        name: "手動エフェクトキュー実行",
        description: "手動エフェクトキュー内の次のエフェクトリストを実行します。",
        icon: "fad fa-step-forward",
        categories: ["scripting", "firebot control"]
    },
    optionsTemplate: `
        <eos-container header="手動エフェクトキュー">
            <firebot-searchable-select
                ng-if="manualEffectQueues.length"
                ng-model="effect.effectQueueId"
                placeholder="手動エフェクトキューを選択または検索..."
                items="manualEffectQueues"
            />
            <div ng-if="!manualEffectQueues.length">
                手動エフェクトキューが保存されていません。
            </div>
        </eos-container>
    `,
    optionsController: ($scope, effectQueuesService: any) => {
        $scope.manualEffectQueues = effectQueuesService.getEffectQueues().filter((q: EffectQueueConfig) => q.mode === "manual");

        if (!$scope.effect.effectQueueId) {
            const selectedQueue = $scope.manualEffectQueues.find((q: EffectQueueConfig) => q.id === $scope.effect.effectQueueId);

            if (selectedQueue == null) {
                $scope.effect.effectQueueId = null;
            }
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (effect.effectQueueId == null) {
            errors.push("手動エフェクトキューを選択してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect, effectQueuesService) => {
        const queue = effectQueuesService.getEffectQueue(effect.effectQueueId);
        return queue?.name ?? "不明なキュー";
    },
    onTriggerEvent: ({ effect }) => {
        const queue = EffectQueueConfigManager.getItem(effect.effectQueueId);

        if (queue == null) {
            logger.debug(`Effect queue ${effect.effectQueueId} not found`);
            return false;
        }

        if (queue.mode !== "manual") {
            logger.debug(`Effect queue ${effect.effectQueueId} is not a manual queue`);
            return false;
        }

        queueRunner.triggerQueue(queue.id);

        return true;
    }
};

export = effect;