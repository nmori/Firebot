import type { EffectType, EffectQueueConfig } from "../../../types/effects";
import { EffectQueueConfigManager } from "../queues/effect-queue-config-manager";
import logger from "../../logwrapper";

const effect: EffectType<{
    effectQueue: string;
    action: "Pause" | "Resume" | "Toggle";
    runEffectsImmediatelyWhenPaused?: boolean;
}> = {
    definition: {
        id: "firebot:pause-effect-queue",
        name: "演出キューの一時停止／再開",
        description: "演出キューを一時停止または再開します。一時停止されたキューに送られた演出は、キューが再開されると実行されます。",
        icon: "fad fa-pause-circle",
        categories: ["scripting", "firebot control"]
    },
    optionsTemplate: `
        <eos-container header="演出キュー">
            <div class="btn-group" ng-if="effectQueues.length">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="list-effect-type">{{effectQueueName ? effectQueueName : 'Pick one'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li ng-repeat="queue in effectQueues" ng-click="selectEffectQueue(queue)">
                        <a href>{{queue.name}}</a>
                    </li>
                </ul>
            </div>
            <div ng-if="!effectQueues.length">
                演出キューが保存されていない。
            </div>
        </eos-container>

        <eos-container header="Action" ng-if="effect.effectQueue != null" pad-top="true">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="list-effect-type">{{effect.action ? effect.action : 'Pick One'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li ng-click="effect.action = 'Pause'">
                        <a href>一時停止</a>
                    </li>
                    <li ng-click="effect.action = 'Resume'">
                        <a href>再開</a>
                    </li>
                    <li ng-click="effect.action = 'Toggle'">
                        <a href>切り替え</a>
                    </li>
                </ul>
            </div>
            <firebot-checkbox
                ng-if="effect.action === 'Pause' || effect.action === 'Toggle'"
                label="一時停止中は演出を即時実行"
                tooltip="キューが一時停止中に演出が追加された場合、再開を待たずに即時実行します。キュー機能を一時的に止めたいが、演出は通常通り流したい場合に便利です。"
                model="effect.runEffectsImmediatelyWhenPaused"
                allow-indeterminate="true"
                style="margin-top: 15px; margin-bottom: 0px;"
            />
        </eos-container>
    `,
    optionsController: ($scope, effectQueuesService) => {
        $scope.effectQueues = effectQueuesService.getEffectQueues();
        $scope.effectQueueName = null;

        if ($scope.effect.effectQueue?.length > 0) {
            const selectedQueue = effectQueuesService.getEffectQueue($scope.effect.effectQueue);
            $scope.effectQueueName = selectedQueue?.name;

            if (selectedQueue == null) {
                $scope.effect.effectQueue = null;
            }
        }

        $scope.selectEffectQueue = (queue: EffectQueueConfig) => {
            $scope.effect.effectQueue = queue.id;
            $scope.effectQueueName = queue.name;
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (effect.effectQueue == null) {
            errors.push("演出キューを指定してください");
        } else if (effect.action == null) {
            errors.push("アクションを選んでください");
        }

        return errors;
    },
    getDefaultLabel: (effect, effectQueuesService) => {
        const queue = effectQueuesService.getEffectQueue(effect.effectQueue);
        return `${effect.action} ${queue?.name ?? "Unknown Queue"}`;
    },
    onTriggerEvent: ({ effect }) => {
        const queue = EffectQueueConfigManager.getItem(effect.effectQueue);

        if (queue == null) {
            logger.debug(`Effect queue ${effect.effectQueue} not found`);
            return false;
        }
        if (effect.action === "Pause") {
            EffectQueueConfigManager.pauseQueue(effect.effectQueue, effect.runEffectsImmediatelyWhenPaused);
        } else if (effect.action === "Resume") {
            EffectQueueConfigManager.resumeQueue(effect.effectQueue);
        } else {
            EffectQueueConfigManager.toggleQueue(effect.effectQueue, effect.runEffectsImmediatelyWhenPaused);
        }

        return true;
    }
};

export = effect;