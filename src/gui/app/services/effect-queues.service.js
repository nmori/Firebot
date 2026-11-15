"use strict";

(function () {

    angular
        .module("firebotApp")
        .factory("effectQueuesService", function (backendCommunicator, utilityService,
            objectCopyHelper, ngToast) {
            const service = {};

            service.effectQueues = [];

            const updateEffectQueue = (effectQueue) => {
                const index = service.effectQueues.findIndex(eq => eq.id === effectQueue.id);
                if (index > -1) {
                    service.effectQueues[index] = effectQueue;
                } else {
                    service.effectQueues.push(effectQueue);
                }
            };

            backendCommunicator.on("effect-queues:all-queues", (effectQueues) => {
                if (effectQueues != null) {
                    service.effectQueues = effectQueues;
                }
            });

            backendCommunicator.on("updateQueueLength", (queue) => {
                const index = service.effectQueues.findIndex(eq => eq.id === queue.id);
                if (service.effectQueues[index] != null) {
                    service.effectQueues[index].length = queue.length;
                }
            });

            backendCommunicator.on("updateQueueStatus", (queue) => {
                const index = service.effectQueues.findIndex(eq => eq.id === queue.id);
                if (service.effectQueues[index] != null) {
                    service.effectQueues[index].active = queue.active;
                }
            });

            service.queueModes = [
                {
                    value: "auto",
                    label: "順番",
                    description: "演出リストは順番に1つずつ実行されます。優先設定の項目はキュー先頭に配置されます。",
                    iconClass: "fa-sort-numeric-down"
                },
                {
                    value: "custom",
                    label: "カスタム遅延",
                    description: "各演出リストごとに、次のリストを実行するまでの待機時間を設定します。",
                    iconClass: "fa-clock"
                },
                {
                    value: "interval",
                    label: "間隔",
                    description: "演出リストを一定間隔で実行します。",
                    iconClass: "fa-stopwatch"
                },
                {
                    value: "manual",
                    label: "手動",
                    description: "演出リストは「手動キュー実行」演出でのみ実行されます。",
                    iconClass: "fa-step-forward"
                }
            ];

            service.getEffectQueues = () => {
                return service.effectQueues;
            };

            service.getEffectQueue = (id) => {
                return service.effectQueues.find(eq => eq.id === id);
            };

            service.saveEffectQueue = async (effectQueue) => {
                const savedEffectQueue = await backendCommunicator.fireEventAsync("effect-queues:save-effect-queue", effectQueue);

                if (savedEffectQueue != null) {
                    updateEffectQueue(savedEffectQueue);

                    return true;
                }

                return false;
            };

            service.toggleEffectQueue = (queue) => {
                backendCommunicator.send("effect-queues:toggle-effect-queue", queue.id);
                queue.active = !queue.active;
            };

            service.clearEffectQueue = (queueId) => {
                backendCommunicator.send("effect-queues:clear-effect-queue", queueId);
            };

            service.saveAllEffectQueues = (effectQueues) => {
                service.effectQueues = effectQueues;
                backendCommunicator.send("effect-queues:save-all-effect-queues", effectQueues);
            };

            service.effectQueueNameExists = (name) => {
                return service.effectQueues.some(eq => eq.name === name);
            };

            service.duplicateEffectQueue = async (effectQueueId) => {
                const effectQueue = service.effectQueues.find(eq => eq.id === effectQueueId);
                if (effectQueue == null) {
                    return;
                }

                const copiedEffectQueue = objectCopyHelper.copyObject("effect_queue", effectQueue);
                copiedEffectQueue.id = null;

                while (service.effectQueueNameExists(copiedEffectQueue.name)) {
                    copiedEffectQueue.name += " copy";
                }

                const successful = await service.saveEffectQueue(copiedEffectQueue);
                if (successful) {
                    ngToast.create({
                        className: 'success',
                        content: '演出キューを複製しました。'
                    });
                } else {
                    ngToast.create("演出キューの複製に失敗しました。");
                }
            };

            service.deleteEffectQueue = (effectQueueId) => {
                service.effectQueues = service.effectQueues.filter(eq => eq.id !== effectQueueId);
                backendCommunicator.send("effect-queues:delete-effect-queue", effectQueueId);
            };

            service.showAddEditEffectQueueModal = (effectQueueId) => {
                return new Promise((resolve) => {
                    let effectQueue;

                    if (effectQueueId != null) {
                        effectQueue = service.getEffectQueue(effectQueueId);
                    }

                    utilityService.showModal({
                        component: "addOrEditEffectQueueModal",
                        size: "md",
                        resolveObj: {
                            effectQueue: () => effectQueue
                        },
                        closeCallback: (response) => {
                            resolve(response.effectQueue.id);
                        }
                    });
                });
            };

            service.showDeleteEffectQueueModal = (effectQueueId) => {
                return new Promise((resolve) => {
                    if (effectQueueId == null) {
                        resolve(false);
                    }

                    const queue = service.getEffectQueue(effectQueueId);
                    if (queue == null) {
                        resolve(false);
                    }

                    return utilityService
                        .showConfirmationModal({
                            title: "演出キューを削除",
                            question: `演出キュー「${queue.name}」を削除してもよろしいですか？`,
                            confirmLabel: "削除",
                            confirmBtnType: "btn-danger"
                        })
                        .then((confirmed) => {
                            if (confirmed) {
                                service.deleteEffectQueue(effectQueueId);
                            }

                            resolve(confirmed);
                        });
                });
            };

            backendCommunicator.send("effect-queues:ui-service-ready");

            return service;
        });
}());