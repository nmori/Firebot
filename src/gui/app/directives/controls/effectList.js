"use strict";
(function() {

    const uuidv1 = require("uuid/v1");

    angular
        .module('firebotApp')
        .component("effectList", {
            bindings: {
                trigger: "@",
                triggerMeta: "<",
                effects: "<",
                update: '&',
                modalId: "@",
                header: "@",
                headerClasses: "@",
                effectContainerClasses: "@",
                hideNumbers: "<"
            },
            template: `
            <div class="effect-list">
                <div class="flex-row-center jspacebetween effect-list-header">
                    <div class="flex items-center">
                        <h3 class="{{$ctrl.headerClasses}} m-0" style="display:inline;font-weight: 600;">���o</h3>
                        <span class="ml-1" style="font-size: 11px;"><tooltip text="$ctrl.header" ng-if="$ctrl.header"></tooltip></span>
                    </div>

                    <div class="flex items-center">
                        <div class="mr-7" ng-if="$ctrl.getSelectedQueueModeIsCustom()">
                            <div style="font-size: 10px;opacity: 0.8;text-align: right;" aria-label="���o�̎������ԁF �L���[�����̉��o���X�g���N��������A���̉��o�����s����܂łɑ҂ׂ����v���� (�b)�B">
                                ���o�̎�������
                                <tooltip role="tooltip" aria-label="The total duration in seconds the queue should wait after triggering this effect list before running the next one." text="'���̉��o���X�g���N�����ăL���[�ɂ��ꂽ��A���̉��o���X�g�����s����܂ł̍��v���ԁi�b�j�B'"></tooltip>
                            </div>
                            <div
                                class="flex justify-end items-center"
                                style="font-size: 12px;"
                                ng-click="$ctrl.openEditQueueDurationModal()"
                                aria-label="���o�̎�������: {{$ctrl.effectsData.queueDuration || 0}} �b"
                                role="button"
                            >
                                <b>{{$ctrl.effectsData.queueDuration || 0}}</b>s<span class="muted ml-2" style="font-size: 9px;"><i class="fal fa-edit"></i></span>
                            </div>
                        </div>

                        <div class="mr-7" ng-if="$ctrl.validQueueSelected()">
                            <div style="font-size: 10px;opacity: 0.8;text-align: right;" aria-label="Queue Priority: If an effect list has priority, it will get added in front of other lists in the queue that do not have priority.">
                                �L���[�̗D�揇��
                                <tooltip role="tooltip" aria-label="If an effect list has priority, it will get added in front of other lists in the queue that do not have priority." text="'���o���X�g�ɗD�揇�ʂ�����ꍇ�A�L���[���̗D�揇�ʂ������Ȃ����̃��X�g�̑O�ɒǉ�����܂��B'"></tooltip>
                            </div>
                            <div class="text-dropdown filter-mode-dropdown" uib-dropdown uib-dropdown-toggle>
                                <a href role="button" class="ddtext" style="font-size: 12px;" aria-label="Selected: {{$ctrl.getSelectedQueuePriority() === 'Yes' ? '��' : '�Ȃ�'}}">
                                    {{$ctrl.getSelectedQueuePriority()}}<span class="fb-arrow down ddtext"></span>
                                </a>
                                <ul class="dropdown-menu" uib-dropdown-menu role="menu">
                                    <li role="none">
                                        <a href ng-click="$ctrl.effectsData.queuePriority = 'high'" class="pl-4" role="menuitem" aria-label="��">Yes</a>
                                    </li>
                                    <li role="none">
                                        <a href ng-click="$ctrl.effectsData.queuePriority = 'none'" class="pl-4" role="menuitem" aria-label="�Ȃ�">No</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="flex flex-col items-end mr-8">
                            <div style="font-size: 10px;opacity: 0.8;text-align: right;">
                                �L���[
                                <tooltip role="tooltip" aria-label="���o�L���[�ł́A���o���d�Ȃ�Ȃ��悤�ɃL���[�ɓ���ď��ԂɎ��s���邱�Ƃ��ł��܂��B���ɃC�x���g�ɕ֗��ł��B" text="'���o�L���[�́A���o���d�Ȃ�Ȃ��悤�ɃL���[�ɓ���ď��ԂɎ��s���邱�Ƃ��ł��܂��B���ɃC�x���g�ɖ𗧂��܂�'"></tooltip>
                            </div>
                            <div class="text-dropdown filter-mode-dropdown" uib-dropdown uib-dropdown-toggle>
                                <a href role="button" class="ddtext" style="font-size: 12px;"> "{{$ctrl.getSelectedEffectQueueName()}}" <span class="fb-arrow down ddtext"></span></a>
                                <ul class="dropdown-menu" uib-dropdown-menu role="menu">
                                    <li role="none">
                                        <a
                                            href
                                            class="pl-4"
                                            ng-click="$ctrl.effectsData.queue = null"
                                            role="menuitem"
                                        >
                                            ���� <tooltip role="tooltip" aria-label="Effects will always play immediately when triggered" text="'���o�͋N�������Ƒ����ɍĐ�����܂�'"></tooltip>
                                            <span ng-show="$ctrl.effectsData.queue == null" style="color:green;display: inline-block;"><i class="fas fa-check"></i></span>
                                        </a>
                                    </li>

                                    <li ng-repeat="queue in $ctrl.eqs.getEffectQueues() track by queue.id" role="none">
                                        <a href class="pl-4" ng-click="$ctrl.toggleQueueSelection(queue.id)" role="menuitem" aria-label="Queue: {{queue.name}}">
                                            <span>{{queue.name}}</span>
                                            <span ng-show="$ctrl.effectsData.queue === queue.id" style="color:green;display: inline-block;"><i class="fas fa-check"></i></span>
                                        </a>
                                    </li>

                                    <li ng-show="$ctrl.eqs.getEffectQueues().length < 1" role="none">
                                        <a class="muted pl-4" role="menuitem">�L���[�͍쐬����Ă��܂���.</a>
                                    </li>

                                    <li role="separator" class="divider"></li>
                                    <li role="none">
                                        <a href class="pl-4" ng-click="$ctrl.showAddEditEffectQueueModal()" role="menuitem">�L���[���쐬</a>
                                    </li>

                                    <li role="none" ng-show="$ctrl.validQueueSelected()">
                                        <a href class="pl-4" ng-click="$ctrl.showAddEditEffectQueueModal($ctrl.effectsData.queue)" role="menuitem">�ҏW�F"{{$ctrl.getSelectedEffectQueueName()}}"</a>
                                    </li>

                                    <li role="none" ng-show="$ctrl.validQueueSelected()">
                                        <a href class="pl-4" ng-click="$ctrl.showDeleteEffectQueueModal($ctrl.effectsData.queue)" role="menuitem">�폜�F"{{$ctrl.getSelectedEffectQueueName()}}"</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="test-effects-btn clickable" uib-tooltip="Test Effects" aria-label="Test effects" ng-click="$ctrl.testEffects()" role="button">
                            <i class="far fa-play-circle"></i>
                        </div>

                        <div>
                            <a
                                href role="button"
                                aria-label="���o���j���[���J��"
                                class="effects-actions-btn"
                                context-menu="$ctrl.createAllEffectsMenuOptions()"
                                context-menu-on="click"
                                uib-tooltip="���o���j���[���J��"
                                tooltip-append-to-body="true"
                            >
                                <i class="fal fa-ellipsis-v"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="{{$ctrl.effectContainerClasses}} mx-6 pb-6">
                    <div ui-sortable="$ctrl.sortableOptions" ng-model="$ctrl.effectsData.list">
                        <div ng-repeat="effect in $ctrl.effectsData.list track by $index" context-menu="$ctrl.createEffectMenuOptions(effect)">
                            <div
                                role="button"
                                class="effect-bar clickable-dark"
                                ng-class="{'disabled': !effect.active}"
                                ng-click="$ctrl.openEditEffectModal(effect, $index, $ctrl.trigger, false)"
                                ng-mouseenter="hovering = true"
                                ng-mouseleave="hovering = false">
                                    <span class="pr-4" style="display: inline-block;text-overflow: ellipsis;overflow: hidden;line-height: 20px;white-space: nowrap;">
                                        <span class="muted" ng-hide="$ctrl.hideNumbers === true">{{$index + 1}}. </span>
                                        {{$ctrl.getEffectNameById(effect.type)}}
                                        <span ng-if="effect.effectLabel" class="muted"> ({{effect.effectLabel}})</span>
                                    </span>
                                    <span class="flex-row-center">
                                        <span class="dragHandle flex items-center justify-center" style="height: 38px; width: 15px;" ng-class="{'hiddenHandle': !hovering}" ng-click="$event.stopPropagation()">
                                            <i class="fal fa-bars"></i>
                                        </span>
                                        <div
                                            class="flex items-center justify-center"
                                            style="font-size: 20px;height: 38px;width: 35px;text-align: center;"
                                            ng-click="$event.stopPropagation()"
                                        >
                                            <a
                                                href
                                                class="effects-actions-btn"
                                                aria-label="Open effect menu"
                                                uib-tooltip="Open effect menu"
                                                tooltip-append-to-body="true"
                                                role="button"
                                                context-menu="$ctrl.createEffectMenuOptions(effect)"
                                                context-menu-on="click"
                                                context-menu-orientation="top"
                                            >
                                                <i class="fal fa-ellipsis-v"></i>
                                            </a>
                                        </div>
                                    </span>
                            </div>
                        </div>
                    </div>

                    <div class="add-more-functionality mt-7 ml-5">
                        <a href role="button" class="clickable" ng-click="$ctrl.openNewEffectModal($ctrl.effectsData.list.length)" aria-label="Add new effect">
                            <i class="far fa-plus-circle mr-2"></i>���o�̒ǉ�
                        </a>
                    </div>
                </div>

            </div>
            `,
            controller: function(utilityService, effectHelperService, objectCopyHelper, effectQueuesService,
                backendCommunicator, ngToast, $http) {
                const ctrl = this;

                ctrl.effectsData = {
                    list: []
                };

                let effectDefinitions = [];

                function createEffectsData() {
                    if (ctrl.effects != null && !Array.isArray(ctrl.effects)) {
                        ctrl.effectsData = ctrl.effects;
                    }
                    if (ctrl.effectsData.list == null) {
                        ctrl.effectsData.list = [];
                    }
                    if (ctrl.effectsData.id == null) {
                        ctrl.effectsData.id = uuidv1();
                    }

                    ctrl.effectsData.list.forEach(e => {
                        if (e.active == null) {
                            e.active = true;
                        }
                    });

                    ctrl.effectsUpdate();
                }

                ctrl.createAllEffectsMenuOptions = () => {
                    const allEffectsMenuOptions = [
                        {
                            html: `<a href role="menuitem"><i class="far fa-copy mr-4"></i> �R�s�[</a>`,
                            click: () => {
                                ctrl.copyEffects();
                            },
                            enabled: ctrl.effectsData.list.length > 0
                        },
                        {
                            html: `<a href role="menuitem"><i class="far fa-paste mr-4"></i> �E�y�[�X�g</a>`,
                            click: function () {
                                ctrl.pasteEffects(true);
                            },
                            enabled: ctrl.hasCopiedEffects()
                        },
                        {
                            html: `<a href role="menuitem" style="color: #fb7373;"><i class="far fa-trash-alt mr-4"></i>  ���ׂč폜</a>`,
                            click: function () {
                                ctrl.removeAllEffects();
                            },
                            enabled: ctrl.effectsData.list.length > 0
                        },
                        {
                            html: `<a href role="menuitem"><i class="far fa-share-alt mr-4"></i> ���L</a>`,
                            click: function () {
                                ctrl.shareEffects();
                            },
                            enabled: ctrl.effectsData.list.length > 0,
                            hasTopDivider: true
                        },
                        {
                            html: `<a href ><i class="far fa-cloud-download-alt mr-4"></i> ���L���o����荞��</a>`,
                            click: function () {
                                ctrl.importSharedEffects();
                            }
                        }
                    ];

                    return allEffectsMenuOptions;
                };

                ctrl.createEffectMenuOptions = (effect) => {
                    const effectMenuOptions = [
                        {
                            html: `<a href ><i class="far fa-tag mr-4"></i> ���x����ҏW</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.editLabelForEffectAtIndex($index);
                            }
                        },
                        {
                            html: `<a href ><i class="far fa-edit mr-4"></i> ���o��ҏW</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                const effect = $itemScope.effect;
                                ctrl.openEditEffectModal(effect, $index, ctrl.trigger, false);
                            }
                        },
                        {
                            html: `<a href ><i class="fal fa-toggle-off mr-4"></i> �L�����̐؂�ւ�</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.toggleEffectActiveState($index);
                            }
                        },
                        {
                            html: `<a href ><i class="far fa-clone mr-4"></i> ����</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.duplicateEffectAtIndex($index);
                            }
                        },
                        {
                            html: `<a href ><i class="far fa-copy mr-4"></i> �R�s�[</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.copyEffectAtIndex($index);
                            }
                        },
                        {
                            html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt mr-4"></i> �폜</a>`,
                            click: function ($itemScope) {
                                const $index = $itemScope.$index;
                                ctrl.removeEffectAtIndex($index);
                            }
                        },
                        {
                            text: "�\��t��...",
                            hasTopDivider: true,
                            enabled: ctrl.hasCopiedEffects(),
                            children: [
                                {
                                    html: `<a href><i class="far fa-paste mr-4"></i> �O��</a>`,
                                    click: function ($itemScope) {
                                        const $index = $itemScope.$index;
                                        if (ctrl.hasCopiedEffects()) {
                                            ctrl.pasteEffectsAtIndex($index, true);
                                        }
                                    }
                                },
                                {
                                    html: `<a href><i class="far fa-paste mr-4"></i> ���</a>`,
                                    click: function ($itemScope) {
                                        const $index = $itemScope.$index;
                                        if (ctrl.hasCopiedEffects()) {
                                            ctrl.pasteEffectsAtIndex($index, false);
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            text: "�V�K...",
                            children: [
                                {
                                    html: `<a href><i class="far fa-plus mr-4"></i> �O��</a>`,
                                    click: function ($itemScope) {
                                        const $index = $itemScope.$index;
                                        ctrl.openNewEffectModal($index - 1);
                                    }
                                },
                                {
                                    html: `<a href><i class="far fa-plus mr-4"></i> ���</a>`,
                                    click: function ($itemScope) {
                                        const $index = $itemScope.$index;
                                        ctrl.openNewEffectModal($index);
                                    }
                                }
                            ]
                        }
                    ];

                    return effectMenuOptions;
                };

                ctrl.shareEffects = async () => {
                    const shareCode = await backendCommunicator.fireEventAsync("getEffectsShareCode", ctrl.effectsData.list);
                    if (shareCode == null) {
                        ngToast.create("���L���o��L���ɂł��܂���");
                    } else {
                        utilityService.showModal({
                            component: "copyShareCodeModal",
                            size: 'sm',
                            resolveObj: {
                                shareCode: () => shareCode,
                                title: () => "���o�̋��L�R�[�h",
                                message: () => "���̐l�������̉��o����荞�ނɂ́A�ȉ��̃R�[�h�����L���Ă��������B"
                            }
                        });
                    }
                };

                function getSharedEffects(code) {
                    return $http.get(`https://bytebin.lucko.me/${code}`)
                        .then(resp => {
                            if (resp.status === 200) {
                                return JSON.parse(unescape(JSON.stringify(resp.data)));
                            }
                            return null;
                        }, () => {
                            return null;
                        });
                }

                ctrl.importSharedEffects = () => {
                    utilityService.openGetInputModal(
                        {
                            model: "",
                            label: "���L���o����M���邽�߂̃R�[�h�����",
                            saveText: "�ǉ�����",
                            inputPlaceholder: "�R�[�h�̓���",
                            validationFn: (shareCode) => {
                                return new Promise(async resolve => {
                                    if (shareCode == null || shareCode.trim().length < 1) {
                                        resolve(false);
                                    }

                                    const effectsData = await getSharedEffects(shareCode);

                                    if (effectsData == null || effectsData.effects == null) {
                                        resolve(false);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            },
                            validationText: "�L���ȉ��o�R�[�h�ł͂Ȃ�."

                        },
                        async (shareCode) => {
                            const effectsData = await getSharedEffects(shareCode);
                            if (effectsData.effects != null) {
                                ctrl.effectsData.list = ctrl.effectsData.list.concat(effectsData.effects);
                            }
                        });
                };

                // when the element is initialized
                ctrl.$onInit = async function() {
                    createEffectsData();
                    effectDefinitions = await effectHelperService.getAllEffectDefinitions();
                };

                ctrl.getEffectNameById = id => {
                    if (!effectDefinitions || effectDefinitions.length < 1) {
                        return "";
                    }

                    return effectDefinitions.find(e => e.id === id).name;
                };

                ctrl.$onChanges = function() {
                    createEffectsData();
                };

                ctrl.effectsUpdate = function() {
                    ctrl.update({ effects: ctrl.effectsData });
                };

                ctrl.effectTypeChanged = function(effectType, index) {
                    ctrl.effectsData.list[index].type = effectType.id;
                };
                ctrl.testEffects = function() {
                    ipcRenderer.send('runEffectsManually', { effects: ctrl.effectsData });
                };

                ctrl.getLabelButtonTextForLabel = function(labelModel) {
                    if (labelModel == null || labelModel.length === 0) {
                        return "���x���̒ǉ�";
                    }
                    return "���x���̕ҏW";
                };

                ctrl.editLabelForEffectAtIndex = function(index) {
                    const effect = ctrl.effectsData.list[index];
                    const label = effect.effectLabel;
                    utilityService.openGetInputModal(
                        {
                            model: label,
                            label: ctrl.getLabelButtonTextForLabel(label),
                            saveText: "���x����ۑ�"
                        },
                        (newLabel) => {
                            if (newLabel == null || newLabel.length === 0) {
                                effect.effectLabel = null;
                            } else {
                                effect.effectLabel = newLabel;
                            }
                        });
                };

                ctrl.toggleEffectActiveState = (index) => {
                    const effect = ctrl.effectsData.list[index];
                    effect.active = !effect.active;
                };

                ctrl.duplicateEffectAtIndex = function(index) {
                    const effect = JSON.parse(angular.toJson(ctrl.effectsData.list[index]));
                    effect.id = uuidv1();
                    ctrl.effectsData.list.splice(index + 1, 0, effect);
                    ctrl.effectsUpdate();
                };

                ctrl.sortableOptions = {
                    handle: ".dragHandle",
                    stop: () => {
                        ctrl.effectsUpdate();
                    }
                };

                ctrl.removeEffectAtIndex = function(index) {
                    ctrl.effectsData.list.splice(index, 1);
                    ctrl.effectsUpdate();
                };

                ctrl.removeAllEffects = function() {
                    ctrl.effectsData.list = [];
                    ctrl.effectsUpdate();
                };

                ctrl.hasCopiedEffects = function() {
                    return objectCopyHelper.hasCopiedEffects();
                };

                ctrl.pasteEffects = async function(append = false) {
                    if (objectCopyHelper.hasCopiedEffects()) {
                        if (append) {
                            ctrl.effectsData.list = ctrl.effectsData.list.concat(
                                await objectCopyHelper.getCopiedEffects(ctrl.trigger, ctrl.triggerMeta)
                            );
                        } else {
                            ctrl.effectsData.list = await objectCopyHelper.getCopiedEffects(ctrl.trigger, ctrl.triggerMeta);
                        }
                        ctrl.effectsUpdate();
                    }
                };

                ctrl.pasteEffectsAtIndex = async (index, above) => {
                    if (objectCopyHelper.hasCopiedEffects()) {
                        if (!above) {
                            index++;
                        }
                        const copiedEffects = await objectCopyHelper.getCopiedEffects(ctrl.trigger, ctrl.triggerMeta);
                        ctrl.effectsData.list.splice(index, 0, ...copiedEffects);
                        ctrl.effectsUpdate();
                    }
                };

                ctrl.copyEffectAtIndex = function(index) {
                    objectCopyHelper.copyEffects([ctrl.effectsData.list[index]]);
                };

                ctrl.copyEffects = function() {
                    objectCopyHelper.copyEffects(ctrl.effectsData.list);
                };

                ctrl.openNewEffectModal = index => {
                    utilityService.showModal({
                        component: "addNewEffectModal",
                        backdrop: true,
                        windowClass: "no-padding-modal",
                        resolveObj: {
                            trigger: () => ctrl.trigger,
                            triggerMeta: () => ctrl.triggerMeta
                        },
                        closeCallback: resp => {
                            if (resp == null) {
                                return;
                            }

                            const { selectedEffectDef } = resp;

                            const newEffect = {
                                id: uuidv1(),
                                type: selectedEffectDef.id,
                                active: true
                            };

                            if (index == null) {
                                ctrl.openEditEffectModal(newEffect, null, ctrl.trigger, true);
                                return;
                            }

                            ctrl.openEditEffectModal(newEffect, index, ctrl.trigger, true);
                        }
                    });
                };

                ctrl.openEditEffectModal = (effect, index, trigger, isNew) => {
                    utilityService.showEditEffectModal(effect, index, trigger, response => {
                        if (response.action === "add") {
                            ctrl.effectsData.list.splice(index + 1, 0, response.effect);
                        } else if (response.action === "update") {
                            ctrl.effectsData.list[response.index] = response.effect;
                        } else if (response.action === "delete") {
                            ctrl.removeEffectAtIndex(response.index);
                        }
                        ctrl.effectsUpdate();
                    }, ctrl.triggerMeta, isNew);
                };

                //effect queue

                ctrl.eqs = effectQueuesService;

                ctrl.getSelectedEffectQueueName = () => {
                    const unsetDisplay = "���ݒ�";
                    if (ctrl.effectsData.queue == null) {
                        return unsetDisplay;
                    }

                    const queue = effectQueuesService.getEffectQueue(ctrl.effectsData.queue);
                    if (queue == null) {
                        return unsetDisplay;
                    }

                    return queue.name;
                };

                ctrl.getSelectedQueuePriority = () => {
                    const priority = ctrl.effectsData.queuePriority;
                    return priority === 'high' ? '�͂�' : '������';
                };

                ctrl.getSelectedQueueModeIsCustom = () => {
                    if (ctrl.effectsData.queue == null) {
                        return false;
                    }

                    const queue = effectQueuesService.getEffectQueue(ctrl.effectsData.queue);
                    if (queue == null) {
                        return false;
                    }

                    return queue.mode === "custom";
                };

                ctrl.toggleQueueSelection = (queueId) => {
                    if (ctrl.effectsData.queue !== queueId) {
                        ctrl.effectsData.queue = queueId;
                    } else {
                        ctrl.effectsData.queue = null;
                    }
                };

                ctrl.validQueueSelected = () => {
                    if (ctrl.effectsData.queue == null) {
                        return false;
                    }

                    const queue = effectQueuesService.getEffectQueue(ctrl.effectsData.queue);
                    return queue != null;
                };

                ctrl.showAddEditEffectQueueModal = (queueId) => {
                    effectQueuesService.showAddEditEffectQueueModal(queueId)
                        .then(id => {
                            ctrl.effectsData.queue = id;
                        });
                };

                ctrl.showDeleteEffectQueueModal = (queueId) => {
                    effectQueuesService.showDeleteEffectQueueModal(queueId)
                        .then(confirmed => {
                            if (confirmed) {
                                ctrl.effectsData.queue = undefined;
                            }
                        });
                };

                ctrl.openEditQueueDurationModal = () => {
                    utilityService.openGetInputModal(
                        {
                            model: ctrl.effectsData.queueDuration || 0,
                            label: "���Ԃ̕ҏW",
                            saveText: "�ۑ�",
                            inputPlaceholder: "�b�������",
                            validationFn: (value) => {
                                return new Promise(resolve => {
                                    if (value == null || value < 0) {
                                        return resolve(false);
                                    }
                                    resolve(true);
                                });
                            },
                            validationText: "�����͂O���傫���K�v������܂�."

                        },
                        (newDuration) => {
                            ctrl.effectsData.queueDuration = newDuration;
                        }
                    );
                };

            }
        });
}());
