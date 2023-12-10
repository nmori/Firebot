"use strict";

(function() {

    angular
        .module("firebotApp")
        .factory("effectQueuesService", function(backendCommunicator, utilityService,
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

            service.loadEffectQueues = async () => {
                const effectQueues = await backendCommunicator.fireEventAsync("getEffectQueues");
                if (effectQueues != null) {
                    service.effectQueues = effectQueues;
                }
            };

            backendCommunicator.on("all-queues", effectQueues => {
                if (effectQueues != null) {
                    service.effectQueues = effectQueues;
                }
            });

            backendCommunicator.on("updateQueueLength", queue => {
                const index = service.effectQueues.findIndex(eq => eq.id === queue.id);
                if (service.effectQueues[index] != null) {
                    service.effectQueues[index].length = queue.length;
                }
            });

            backendCommunicator.on("updateQueueStatus", queue => {
                const index = service.effectQueues.findIndex(eq => eq.id === queue.id);
                if (service.effectQueues[index] != null) {
                    service.effectQueues[index].active = queue.active;
                }
            });

            service.queueModes = [
                {
                    id: "custom",
                    display: "カスタム",
                    description: "個々の演出リストごとに定義されたカスタム時間を待つ",
                    iconClass: "fa-clock"
                },
                {
                    id: "auto",
                    display: "順序",
                    description: "キュー内の演出リストを順番に実行します。優先度の高いアイテムが、優先度の低いアイテムより先に追加されます（遅延の初期設定は0秒）",
                    iconClass: "fa-arrow-down-1-9"
                },
                {
                    id: "interval",
                    display: "間隔",
                    description: "設定した間隔で演出リストを実行",
                    iconClass: "fa-stopwatch"
                }
            ];

            service.getEffectQueues = () => {
                return service.effectQueues;
            };

            service.getEffectQueue = (id) => {
                return service.effectQueues.find(eq => eq.id === id);
            };

            service.saveEffectQueue = async (effectQueue) => {
                const savedEffectQueue = await backendCommunicator.fireEventAsync("saveEffectQueue", effectQueue);

                if (savedEffectQueue != null) {
                    updateEffectQueue(savedEffectQueue);

                    return true;
                }

                return false;
            };

            service.toggleEffectQueue = (queue) => {
                backendCommunicator.fireEvent("toggleEffectQueue", queue.id);
                queue.active = !queue.active;
            };

            service.clearEffectQueue = (queueId) => {
                backendCommunicator.fireEvent("clearEffectQueue", queueId);
            };

            service.saveAllEffectQueues = (effectQueues) => {
                service.effectQueues = effectQueues;
                backendCommunicator.fireEvent("saveAllEffectQueues", effectQueues);
            };

            service.effectQueueNameExists = (name) => {
                return service.effectQueues.some(eq => eq.name === name);
            };

            service.duplicateEffectQueue = (effectQueueId) => {
                const effectQueue = service.effectQueues.find(eq => eq.id === effectQueueId);
                if (effectQueue == null) {
                    return;
                }

                const copiedEffectQueue = objectCopyHelper.copyObject("effect_queue", effectQueue);
                copiedEffectQueue.id = null;

                while (service.effectQueueNameExists(copiedEffectQueue.name)) {
                    copiedEffectQueue.name += " 複製";
                }

                service.saveEffectQueue(copiedEffectQueue).then(successful => {
                    if (successful) {
                        ngToast.create({
                            className: 'success',
                            content: '演出キューを複製しました'
                        });
                    } else {
                        ngToast.create("演出キューの複製に失敗しました");
                    }
                });
            };

            service.deleteEffectQueue = (effectQueueId) => {
                service.effectQueues = service.effectQueues.filter(eq => eq.id !== effectQueueId);
                backendCommunicator.fireEvent("deleteEffectQueue", effectQueueId);
            };

            service.showAddEditEffectQueueModal = (effectQueueId) => {
                return new Promise(resolve => {
                    let effectQueue;

                    if (effectQueueId != null) {
                        effectQueue = service.getEffectQueue(effectQueueId);
                    }

                    utilityService.showModal({
                        component: "addOrEditEffectQueueModal",
                        size: "sm",
                        resolveObj: {
                            effectQueue: () => effectQueue
                        },
                        closeCallback: response => {
                            resolve(response.effectQueue.id);
                        }
                    });
                });
            };

            service.showDeleteEffectQueueModal = (effectQueueId) => {
                return new Promise(resolve => {
                    if (effectQueueId == null) {
                        resolve(false);
                    }

                    const queue = service.getEffectQueue(effectQueueId);
                    if (queue == null) {
                        resolve(false);
                    }

                    return utilityService
                        .showConfirmationModal({
                            title: "演出キューの削除",
                            question: `次の演出キューを削除しますか？ "${queue.name}"`,
                            confirmLabel: "削除する",
                            confirmBtnType: "btn-danger"
                        })
                        .then(confirmed => {
                            if (confirmed) {
                                service.deleteEffectQueue(effectQueueId);
                            }

                            resolve(confirmed);
                        });
                });
            };

            return service;
        });
}());