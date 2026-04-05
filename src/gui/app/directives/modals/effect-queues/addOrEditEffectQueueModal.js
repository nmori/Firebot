"use strict";

(function () {
    angular.module("firebotApp").component("addOrEditEffectQueueModal", {
        template: `
            <scroll-sentinel element-class="edit-effect-queue-header"></scroll-sentinel>
            <context-menu-modal-header
                class="edit-effect-queue-header"
                on-close="$ctrl.dismiss()"
                trigger-type="effect queue"
                trigger-name="$ctrl.effectQueue.name"
                sort-tags="$ctrl.effectQueue.sortTags"
                show-trigger-name="true"
            ></context-menu-modal-header>
            <div class="modal-body">
                <div>
                    <div class="modal-subheader pb-2 pt-0 px-0">
                        名前 <tooltip text="'このエフェクトキューを識別しやすくするための名前です'">
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group">
                            <input type="text" class="form-control" ng-model="$ctrl.effectQueue.name" placeholder="名前を入力">
                        </div>
                    </div>
                </div>

                <div class="modal-subheader pb-2 pt-0 px-0">モード</div>
                <firebot-radio-cards
                    options="$ctrl.queueModes"
                    ng-model="$ctrl.effectQueue.mode"
                    id="queueMode"
                    name="queueMode"
                    grid-columns="1"
                ></firebot-radio-cards>

                <div class="mt-6" ng-show="$ctrl.effectQueue.mode != null && ($ctrl.effectQueue.mode ==='interval' || $ctrl.effectQueue.mode ==='auto')">
                    <div class="modal-subheader pb-2 pt-0 px-0">間隔/遅延（秒）</div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group">
                            <input type="number" class="form-control" ng-model="$ctrl.effectQueue.interval" placeholder="間隔を入力">
                        </div>
                    </div>
                </div>

                <firebot-checkbox
                    label="一時停止中はエフェクトをすぐ実行する"
                    tooltip="キューが一時停止中にエフェクトが追加された場合、キューの再開を待たずにすぐ実行します。キュー機能を一時的に止めつつ、このキューに設定されたエフェクトを通常どおり実行したいときに便利です。"
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
        controller: function (effectQueuesService, ngToast) {
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
                    ngToast.create("このエフェクトキューの名前を入力してください");
                    return;
                }

                if ($ctrl.effectQueue.mode === "interval" && $ctrl.effectQueue.interval == null) {
                    ngToast.create("このエフェクトキューの間隔を設定してください");
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
                    ngToast.create("エフェクトキューの保存に失敗しました。再試行するか、ログを確認してください。");
                }
            };
        }
    });
}());