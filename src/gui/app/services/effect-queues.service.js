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
                    display: "�J�X�^��",
                    description: "�X�̉��o���X�g���Ƃɒ�`���ꂽ�J�X�^�����Ԃ�҂�",
                    iconClass: "fa-clock"
                },
                {
                    id: "auto",
                    display: "����",
                    description: "�L���[���̉��o���X�g�����ԂɎ��s���܂��B�D��x�̍����A�C�e�����A�D��x�̒Ⴂ�A�C�e������ɒǉ�����܂��i�x���̏����ݒ��0�b�j",
                    iconClass: "fa-sort-numeric-down"
                },
                {
                    id: "interval",
                    display: "�Ԋu",
                    description: "�ݒ肵���Ԋu�ŉ��o���X�g�����s",
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
                    copiedEffectQueue.name += " ����";
                }

                service.saveEffectQueue(copiedEffectQueue).then(successful => {
                    if (successful) {
                        ngToast.create({
                            className: 'success',
                            content: '���o�L���[�𕡐����܂���'
                        });
                    } else {
                        ngToast.create("���o�L���[�̕����Ɏ��s���܂���");
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
                            title: "���o�L���[�̍폜",
                            question: `���̉��o�L���[���폜���܂����H "${queue.name}"`,
                            confirmLabel: "�폜����",
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