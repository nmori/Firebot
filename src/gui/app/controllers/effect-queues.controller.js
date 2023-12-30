"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("effectQueuesController", function(
            $scope,
            effectQueuesService,
            utilityService
        ) {
            $scope.effectQueuesService = effectQueuesService;

            $scope.onEffectQueuesUpdated = (items) => {
                effectQueuesService.saveAllEffectQueues(items);
            };

            $scope.getQueueModeName = (modeId) => {
                const mode = effectQueuesService.queueModes.find(m => m.id === modeId);
                return mode ? mode.display : "�s��";
            };

            $scope.headers = [
                {
                    name: "���O",
                    icon: "fa-user",
                    cellTemplate: `{{data.name}}`,
                    cellController: () => {}
                },
                {
                    name: "���[�h",
                    icon: "fa-bring-forward",
                    cellTemplate: `{{getQueueModeName(data.mode)}}`,
                    cellController: ($scope) => {
                        $scope.getQueueModeName = (modeId) => {
                            const mode = effectQueuesService.queueModes.find(m => m.id === modeId);
                            return mode ? mode.display : "�s��";
                        };
                    }
                },
                {
                    name: "����/�x��",
                    icon: "fa-clock",
                    cellTemplate: `{{(data.mode === 'interval' || data.mode === 'auto') ? (data.interval || 0) + 's' : 'n/a'}}`,
                    cellController: () => {}
                },
                {
                    name: "�L���[�̒���",
                    icon: "fa-tally",
                    cellTemplate: `{{data.length || 0}}`,
                    cellController: () => {}
                }
            ];

            $scope.effectQueueOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen mr-4"></i> �ҏW</a>`,
                        click: function () {
                            effectQueuesService.showAddEditEffectQueueModal(item.id);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> �L�����̐؂�ւ�</a>`,
                        click: function () {
                            effectQueuesService.toggleEffectQueue(item);
                        }
                    },
                    {
                        html: `<a href ><i class="fad fa-minus-circle mr-4"></i> �N���A</a>`,
                        click: function () {
                            effectQueuesService.clearEffectQueue(item.id);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone mr-4"></i> ����</a>`,
                        click: function () {
                            effectQueuesService.duplicateEffectQueue(item.id);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt mr-4"></i> �폜</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "���o�L���[�̍폜",
                                    question: `���o�L���[�u"${item.name}"�v���폜���܂���?`,
                                    confirmLabel: "Delete",
                                    confirmBtnType: "btn-danger"
                                })
                                .then(confirmed => {
                                    if (confirmed) {
                                        effectQueuesService.deleteEffectQueue(item.id);
                                    }
                                });

                        }
                    }
                ];

                return options;
            };
        });
}());
