"use strict";

(function() {
    angular.module("firebotApp").component("addOrEditEffectQueueModal", {
        template: `
            <scroll-sentinel element-class="edit-effect-queue-header"></scroll-sentinel>
            <context-menu-modal-header
                class="edit-effect-queue-header"
                on-close="$ctrl.dismiss()"
                trigger-type="演出キュー"
                trigger-name="$ctrl.effectQueue.name"
                sort-tags="$ctrl.effectQueue.sortTags"
                show-trigger-name="true"
            ></context-menu-modal-header>
            <div class="modal-body">
                <div>
                    <div class="modal-subheader pb-2 pt-0 px-0">
                        名前 <tooltip text="'この演出キューの名前'">
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group">
                            <input type="text" class="form-control" ng-model="$ctrl.effectQueue.name" placeholder="名前の入力">
                        </div>
                    </div>
                </div>

                    <div class="modal-subheader pb-2 pt-0 px-0">動作モード</div>
                <firebot-radio-cards
                    options="$ctrl.queueModes"
                    ng-model="$ctrl.effectQueue.mode"
                    id="queueMode"
                    name="queueMode"
                    grid-columns="1"
                ></firebot-radio-cards>

                <div class="mt-6" ng-show="$ctrl.effectQueue.mode != null && ($ctrl.effectQueue.mode ==='interval' || $ctrl.effectQueue.mode ==='auto')">
                    <div class="modal-subheader pb-2 pt-0 px-0">間隔/遅れ(秒)</div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group">
                            <input type="number" class="form-control" ng-model="$ctrl.effectQueue.interval" placeholder="間隔の入力">
                        </div>
                    </div>
                </div>

                <firebot-checkbox
                    label="Run Effects Immediately When Paused"
                    tooltip="When the queue is paused and effects are added to it, run them immediately instead of waiting for the queue to be resumed. This is useful if you want to temporarily pause queue functionality and have effects set to this queue to run as if there was no queue."
                    model="$ctrl.effectQueue.runEffectsImmediatelyWhenPaused"
                    style="margin-top: 15px; margin-bottom: 0px;"
                />

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function(effectQueuesService, ngToast) {
            const $ctrl = this;

            $ctrl.isNewQueue = true;

            $ctrl.effectQueue = {
                name: "",
                mode: "auto",
                sortTags: [],
                active: true,
                length: 0,
                runEffectsImmediatelyWhenPaused: false
            };

            $ctrl.$onInit = () => {
                if ($ctrl.resolve.effectQueue) {
                    $ctrl.effectQueue = JSON.parse(
                        angular.toJson($ctrl.resolve.effectQueue)
                    );

                    $ctrl.isNewQueue = false;
                }
            };

            $ctrl.queueModes = effectQueuesService.queueModes;

            $ctrl.save = () => {
                if ($ctrl.effectQueue.name == null || $ctrl.effectQueue.name === "") {
                    ngToast.create("名前を入れてください");
                    return;
                }

                if ($ctrl.effectQueue.mode === "interval" && $ctrl.effectQueue.interval == null) {
                    ngToast.create("間隔を入力してください");
                    return;
                }

                const successful = effectQueuesService.saveEffectQueue($ctrl.effectQueue);
                    if (successful) {
                        $ctrl.close({
                            $value: {
                                effectQueue: $ctrl.effectQueue
                            }
                        });
                    } else {
                        ngToast.create("保存に失敗しました。再実行するか、詳細をログで確認してください。");
                    }
            };
        }
    });
}());