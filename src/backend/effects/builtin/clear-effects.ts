import { SettingsManager } from "../../common/settings-manager";
import effectQueueRunner from "../../effects/queues/effect-queue-runner";
import webServer from "../../../server/http-server-manager";
import frontendCommunicator from "../../common/frontend-communicator";
import { abortAllEffectLists } from "../../common/effect-abort-helpers";
import { EffectType } from "../../../types/effects";

const effect: EffectType<{
    overlay: boolean;
    overlayInstance: string;
    sounds: boolean;
    queues: boolean;
    queueId: string;
    abortActiveQueueEffectLists: boolean;
    activeEffectLists: boolean;
}> = {
    definition: {
        id: "firebot:clear-effects",
        name: "エフェクトクリア",
        description: "オーバーレイエフェクトの削除、サウンド停止、エフェクトキューのクリアを行います",
        icon: "fad fa-minus-circle",
        categories: ["common", "overlay", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container>
            <p>このエフェクトは現在実行中のエフェクトをクリアします。たとえばカットシーンに入る際などに便利です。エフェクトキューのパージにも使えます。</p>
        </eos-container>
        <eos-container header="クリア対象">
            <firebot-checkbox
                label="オーバーレイエフェクト"
                model="effect.overlay"
            />
            <div class="mt-0 mr-0 mb-6 ml-6" uib-collapse="!effect.overlay || !settings.getSetting('UseOverlayInstances')">
                <div class="btn-group">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="chat-effect-type">{{ getSelectedOverlayDisplay() }}</span> <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu chat-effect-dropdown">
                        <li role="menuitem" ng-click="effect.overlayInstance = null"><a href>デフォルト</a></li>
                        <li role="menuitem" ng-repeat="instanceName in overlayInstances" ng-click="effect.overlayInstance = instanceName"><a href>{{instanceName}}</a></li>
                        <li class="divider"></li>
                        <li role="menuitem" ng-click="effect.overlayInstance = 'all'"><a href>すべて</a></li>
                    </ul>
                </div>
            </div>
            <firebot-checkbox
                label="サウンド"
                model="effect.sounds"
            />
            <firebot-checkbox
                label="エフェクトキュー"
                model="effect.queues"
            />
            <div uib-collapse="!effect.queues" style="margin: 0 0 15px 15px;" class="mb-6">
                <div class="btn-group mb-5" uib-dropdown>
                    <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                    {{ getSelectedEffectQueueDisplay() }} <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                        <li role="menuitem" ng-click="effect.queueId = 'all'"><a href>すべて</a></li>
                        <li class="divider"></li>
                        <li role="menuitem" ng-repeat="queue in effectQueues" ng-click="effect.queueId = queue.id"><a href>{{queue.name}}</a></li>
                    </ul>
                </div>
                <firebot-checkbox
                    label="キューで実行中のエフェクトリストを中止"
                    tooltip="キューで現在実行中のエフェクトリストを中止します。"
                    model="effect.abortActiveQueueEffectLists"
                />
            </div>
            <firebot-checkbox
                label="実行中のすべてのエフェクトリスト"
                tooltip="現在実行中のすべてのエフェクトリストを中止します。"
                model="effect.activeEffectLists"
            />
        </eos-container>
    `,
    optionsController: ($scope, effectQueuesService, settingsService) => {
        $scope.settings = settingsService;
        $scope.effectQueues = effectQueuesService.getEffectQueues() || [];
        $scope.overlayInstances = settingsService.getSetting("OverlayInstances") || [];

        if ($scope.effect.overlayInstance != null && $scope.effect.overlayInstance !== "all") {
            if (!$scope.overlayInstances.includes($scope.effect.overlayInstance)) {
                $scope.effect.overlayInstance = null;
            }
        }

        $scope.getSelectedOverlayDisplay = () => {
            if ($scope.effect.overlayInstance == null) {
                return "デフォルト";
            }

            if ($scope.effect.overlayInstance === "all") {
                return "すべて";
            }

            const overlayInstance = $scope.overlayInstances.find(oi => oi === $scope.effect.overlayInstance);
            if (overlayInstance) {
                return overlayInstance;
            }
        };

        if ($scope.effect.queueId != null) {
            const queueStillExists = $scope.effectQueues.some(q => q.id === $scope.effect.queueId);
            if (!queueStillExists) {
                $scope.effect.queueId = "all";
            }
        } else {
            $scope.effect.queueId = "all";
        }

        $scope.getSelectedEffectQueueDisplay = () => {
            if (!$scope.effect.queues) {
                return "なし";
            }

            if ($scope.effect.queueId === "all") {
                return "すべて";
            }

            const effectQueue = $scope.effectQueues.find(q => q.id === $scope.effect.queueId);
            if (effectQueue) {
                return effectQueue.name;
            }
            return "なし";
        };
    },
    onTriggerEvent: (event) => {
        const effect = event.effect;

        if (effect.queues) {
            if (effect.queueId === "all") {
                effectQueueRunner.clearAllQueues(effect.abortActiveQueueEffectLists);
            } else {
                if (effect.queueId) {
                    effectQueueRunner.removeQueue(effect.queueId, effect.abortActiveQueueEffectLists);
                }
            }
        }

        if (effect.sounds) {
            frontendCommunicator.send("stop-all-sounds");
        }

        if (effect.overlay) {
            if (SettingsManager.getSetting("UseOverlayInstances") && effect.overlayInstance != null) {
                if (effect.overlayInstance === "all") {
                    webServer.refreshAllOverlays();
                    return true;
                }

                webServer.refreshOverlayInstance(effect.overlayInstance);
                return true;
            }

            webServer.refreshOverlayInstance();
        }

        if (effect.activeEffectLists) {
            abortAllEffectLists(true);
        }

        return true;
    }
};

export = effect;