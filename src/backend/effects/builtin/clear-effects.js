"use strict";

const webServer = require("../../../server/http-server-manager");
const frontendCommunicator = require("../../common/frontend-communicator");
const effectQueueRunner = require("../../effects/queues/effect-queue-runner");
const { EffectCategory } = require('../../../shared/effect-constants');
const { settings } = require("../../common/settings-access");

/**
 * The Delay effect
 */
const delay = {
    /**
   * The definition of the Effect
   */
    definition: {
        id: "firebot:clear-effects",
        name: "貍泌・繧ｯ繝ｪ繧｢",
        description: "繧ｪ繝ｼ繝舌・繝ｬ繧､貍泌・縺ｮ蜑企勁縲√し繧ｦ繝ｳ繝峨・蛛懈ｭ｢縲∵ｼ泌・繧ｭ繝･繝ｼ縺ｮ繧ｯ繝ｪ繧｢",
        icon: "fad fa-minus-circle",
        categories: [EffectCategory.COMMON, EffectCategory.OVERLAY],
        dependencies: []
    },
    /**
   * Global settings that will be available in the Settings tab
   */
    globalSettings: {},
    /**
   * The HTML template for the Options view (ie options when effect is added to something such as a button.
   * You can alternatively supply a url to a html file via optionTemplateUrl
   */
    optionsTemplate: `
        <eos-container>
            <p>縺薙・貍泌・縺ｯ縲∫樟蝨ｨ螳溯｡御ｸｭ縺ｮ貍泌・繧偵け繝ｪ繧｢縺励∪縺吶ゅき繝・ヨ繧ｷ繝ｼ繝ｳ縺ｫ蜈･繧九→縺阪↑縺ｩ縺ｫ萓ｿ蛻ｩ縺ｧ縺吶ゅ∪縺溘∵ｼ泌・繧ｭ繝･繝ｼ繧貞炎髯､縺吶ｋ縺ｮ縺ｫ繧ゆｽｿ縺医∪縺吶・/p>
        </eos-container>
        <eos-container header="Effects To Clear">
            <firebot-checkbox
                label="繧ｪ繝ｼ繝舌・繝ｬ繧､貍泌・"
                model="effect.overlay"
            />
            <div class="mt-0 mr-0 mb-6 ml-6" uib-collapse="!effect.overlay || !settings.getSetting('UseOverlayInstances')">
                <div class="btn-group">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="chat-effect-type">{{ getSelectedOverlayDisplay() }}</span> <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu chat-effect-dropdown">
                        <li role="menuitem" ng-click="effect.overlayInstance = null"><a href>Default</a></li>
                        <li role="menuitem" ng-repeat="instanceName in overlayInstances" ng-click="effect.overlayInstance = instanceName"><a href>{{instanceName}}</a></li>
                        <li class="divider"></li>
                        <li role="menuitem" ng-click="effect.overlayInstance = 'all'"><a href>All</a></li>
                    </ul>
                </div>
            </div>
            <firebot-checkbox
                label="繧ｵ繧ｦ繝ｳ繝・
                model="effect.sounds"
            />
            <firebot-checkbox
                label="貍泌・繧ｭ繝･繝ｼ"
                model="effect.queues"
            />
            <div uib-collapse="!effect.queues" style="margin: 0 0 15px 15px;" class="mb-6">
                <div class="btn-group mb-5" uib-dropdown>
                    <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                    {{ getSelectedEffectQueueDisplay() }} <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                        <li role="menuitem" ng-click="effect.queueId = 'all'"><a href>All</a></li>
                        <li class="divider"></li>
                        <li role="menuitem" ng-repeat="queue in effectQueues" ng-click="effect.queueId = queue.id"><a href>{{queue.name}}</a></li>
                    </ul>
                </div>
            </div>
        </eos-container>
    `,
    /**
   * The controller for the front end Options
   */
    optionsController: ($scope, effectQueuesService, settingsService) => {
        $scope.settings = settingsService;
        $scope.effectQueues = effectQueuesService.getEffectQueues() || [];
        $scope.overlayInstances = settingsService.getOverlayInstances() || [];

        if ($scope.effect.overlayInstance != null && $scope.effect.overlayInstance !== "all") {
            if (!$scope.overlayInstances.includes($scope.effect.overlayInstance)) {
                $scope.effect.overlayInstance = null;
            }
        }

        $scope.getSelectedOverlayDisplay = () => {
            if ($scope.effect.overlayInstance == null) {
                return "譌｢螳壼､";
            }

            if ($scope.effect.overlayInstance === "all") {
                return "縺吶∋縺ｦ";
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
                return "縺ｪ縺・;
            }

            if ($scope.effect.queueId === "all") {
                return "縺吶∋縺ｦ";
            }

            const effectQueue = $scope.effectQueues.find(q => q.id === $scope.effect.queueId);
            if (effectQueue) {
                return effectQueue.name;
            }
            return "縺ｪ縺・;
        };
    },
    /**
   * When the effect is saved
   */
    optionsValidator: () => {
        const errors = [];
        return errors;
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: async event => {
        const effect = event.effect;

        if (effect.queues) {
            if (effect.queueId === "all") {
                effectQueueRunner.clearAllQueues();
            } else {
                if (effect.queueId) {
                    effectQueueRunner.removeQueue(effect.queueId);
                }
            }
        }

        if (effect.sounds) {
            frontendCommunicator.send("stop-all-sounds");
        }

        if (effect.overlay) {
            if (settings.useOverlayInstances() && effect.overlayInstance != null) {
                if (effect.overlayInstance === "all") {
                    webServer.sendToOverlay("OVERLAY:REFRESH", { global: true });

                    return true;
                }

                webServer.sendToOverlay("OVERLAY:REFRESH", { overlayInstance: effect.overlayInstance });
                return true;
            }

            webServer.sendToOverlay("OVERLAY:REFRESH");
        }

        return true;
    }
};

module.exports = delay;
